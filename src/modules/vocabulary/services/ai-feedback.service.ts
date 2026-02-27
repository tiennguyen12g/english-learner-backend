import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_Feedback_Type } from '../vocabulary.interface';
import { decrypt } from '../../../utils/encryption.util';

@Injectable()
export class AIFeedbackService {
  /**
   * Get AI feedback for a sentence using OpenAI
   */
  async getOpenAIFeedback(
    apiKey: string,
    vocabularyWord: string,
    sentence: string,
  ): Promise<AI_Feedback_Type> {
    try {
      const decryptedKey = decrypt(apiKey);
      const openai = new OpenAI({ apiKey: decryptedKey });

      const prompt = `You are an expert English grammar teacher. A student is learning the word "${vocabularyWord}" and wrote this sentence: "${sentence}"

Please analyze this sentence and provide detailed feedback in JSON format with the following structure:
{
  "isCorrect": boolean (true if sentence is grammatically correct and uses the word properly),
  "grammarScore": number (0-100, where 100 is perfect),
  "feedback": {
    "grammar": string[] (list of grammar errors found, empty if none),
    "spelling": string[] (list of spelling mistakes, empty if none),
    "structure": string[] (list of sentence structure issues, empty if none),
    "improvements": string[] (suggestions for improvement)
  },
  "correctedSentence": string (corrected version if there are errors, otherwise same as original),
  "suggestions": string[] (2-3 alternative ways to use the word in sentences),
  "exampleSentence": string (one example sentence using "${vocabularyWord}" at B1 level or higher, demonstrating proper usage)
}

Important:
- Be encouraging and constructive
- If the sentence is correct, still provide minor suggestions for improvement
- The exampleSentence must be at B1 level or higher (more complex grammar, idiomatic usage)
- Return ONLY valid JSON, no additional text`;

      const completion = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: 'system',
            content: 'You are a helpful English grammar teacher. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const feedback = this.parseAIResponse(responseText);

      return {
        ...feedback,
        exampleSentence: feedback.exampleSentence || this.generateExampleSentence(vocabularyWord),
      };
    } catch (error: any) {
      if (error.status === 401 || error.message?.includes('Invalid API key')) {
        throw new BadRequestException('Invalid OpenAI API key');
      }
      if (error.status === 429) {
        throw new BadRequestException('OpenAI API rate limit exceeded. Please try again later.');
      }
      console.error('OpenAI API error:', error);
      throw new BadRequestException(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get AI feedback for a sentence using Gemini
   */
  async getGeminiFeedback(
    apiKey: string,
    vocabularyWord: string,
    sentence: string,
  ): Promise<AI_Feedback_Type> {
    try {
      const decryptedKey = decrypt(apiKey);
      const genAI = new GoogleGenerativeAI(decryptedKey);
      const model = genAI.getGenerativeModel({  model: "gemini-2.5-flash", });

      const prompt = `You are an expert English grammar teacher. A student is learning the word "${vocabularyWord}" and wrote this sentence: "${sentence}"

Please analyze this sentence and provide detailed feedback in JSON format with the following structure:
{
  "isCorrect": boolean (true if sentence is grammatically correct and uses the word properly),
  "grammarScore": number (0-100, where 100 is perfect),
  "feedback": {
    "grammar": string[] (list of grammar errors found, empty if none),
    "spelling": string[] (list of spelling mistakes, empty if none),
    "structure": string[] (list of sentence structure issues, empty if none),
    "improvements": string[] (suggestions for improvement)
  },
  "correctedSentence": string (corrected version if there are errors, otherwise same as original),
  "suggestions": string[] (2-3 alternative ways to use the word in sentences),
  "exampleSentence": string (one example sentence using "${vocabularyWord}" at B1 level or higher, demonstrating proper usage)
}

Important:
- Be encouraging and constructive
- If the sentence is correct, still provide minor suggestions for improvement
- The exampleSentence must be at B1 level or higher (more complex grammar, idiomatic usage)
- Return ONLY valid JSON, no additional text or markdown formatting`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const feedback = this.parseAIResponse(cleanedText);

      return {
        ...feedback,
        exampleSentence: feedback.exampleSentence || this.generateExampleSentence(vocabularyWord),
      };
    } catch (error: any) {
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key')) {
        throw new BadRequestException('Invalid Gemini API key');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new BadRequestException('Gemini API rate limit exceeded. Please try again later.');
      }
      console.error('Gemini API error:', error);
      throw new BadRequestException(`Gemini API error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Parse AI response JSON
   */
  private parseAIResponse(responseText: string): AI_Feedback_Type {
    try {
      // Try to extract JSON from the response
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to find JSON object in the text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      // Validate and normalize the response
      return {
        isCorrect: Boolean(parsed.isCorrect ?? false),
        grammarScore: Math.max(0, Math.min(100, Number(parsed.grammarScore) || 0)),
        feedback: {
          grammar: Array.isArray(parsed.feedback?.grammar) ? parsed.feedback.grammar : [],
          spelling: Array.isArray(parsed.feedback?.spelling) ? parsed.feedback.spelling : [],
          structure: Array.isArray(parsed.feedback?.structure) ? parsed.feedback.structure : [],
          improvements: Array.isArray(parsed.feedback?.improvements) ? parsed.feedback.improvements : [],
        },
        correctedSentence: parsed.correctedSentence || parsed.sentence || '',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        exampleSentence: parsed.exampleSentence || '',
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response text:', responseText);
      // Return default feedback if parsing fails
      return {
        isCorrect: false,
        grammarScore: 50,
        feedback: {
          grammar: ['Unable to parse AI response'],
          spelling: [],
          structure: [],
          improvements: ['Please try again or check your API key'],
        },
        correctedSentence: '',
        suggestions: [],
        exampleSentence: '',
      };
    }
  }

  /**
   * Generate a simple example sentence (fallback)
   */
  private generateExampleSentence(word: string): string {
    return `Here is an example sentence using "${word}" at a B1 level or higher.`;
  }
}

