import { z } from 'zod';

// ==================== Grammar Note Types ====================
export const KeyPoint_Schema = z.object({
  text: z.string().min(1, 'Key point text is required'),
});

export const GrammarExample_Schema = z.object({
  sentence: z.string().min(1, 'Example sentence is required'),
  explanation: z.string().optional(),
});

export const CommonMistake_Schema = z.object({
  incorrect: z.string().min(1, 'Incorrect usage is required'),
  correct: z.string().min(1, 'Correct usage is required'),
  explanation: z.string().optional(),
});

export const GrammarNote_Create_Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['Tenses', 'Conditionals', 'Passive Voice', 'Articles', 'Prepositions', 'Modal Verbs', 'Reported Speech', 'Relative Clauses', 'Gerunds and Infinitives', 'Phrasal Verbs', 'Other']),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  content: z.string().min(1, 'Content is required'),
  keyPoints: z.array(KeyPoint_Schema).optional(),
  examples: z.array(GrammarExample_Schema).optional(),
  commonMistakes: z.array(CommonMistake_Schema).optional(),
  relatedNotes: z.array(z.string()).optional(),
  visualDiagram: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const GrammarNote_Update_Schema = GrammarNote_Create_Schema.partial();

export const GrammarNote_Query_Schema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  cefrLevel: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'cefrLevel']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ==================== Grammar Exercise Types ====================
export const FillBlankOption_Schema = z.object({
  text: z.string().min(1, 'Blank text is required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  alternatives: z.array(z.string()).optional(),
  explanation: z.string().optional(),
});

export const MultipleChoiceOption_Schema = z.object({
  label: z.string().min(1, 'Label is required'),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

export const MultipleChoiceQuestion_Schema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(MultipleChoiceOption_Schema).min(2, 'At least 2 options are required'),
  explanation: z.string().optional(),
});

export const GrammarExercise_Create_Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['fillBlank', 'multipleChoice', 'sentenceTransformation', 'errorCorrection', 'matching', 'dragDrop']),
  grammarNoteId: z.string().optional(),
  question: z.string().min(1, 'Question is required'),
  fillBlankOptions: z.array(FillBlankOption_Schema).optional(),
  multipleChoiceQuestions: z.array(MultipleChoiceQuestion_Schema).optional(),
  multipleChoiceOptions: z.array(MultipleChoiceOption_Schema).optional(), // Legacy support
  correctAnswer: z.string().optional(),
  alternativeAnswers: z.array(z.string()).optional(),
  explanation: z.string().min(1, 'Explanation is required'),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
});

export const GrammarExercise_Update_Schema = GrammarExercise_Create_Schema.partial();

export const GrammarExercise_Query_Schema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  grammarNoteId: z.string().optional(),
  cefrLevel: z.string().optional(),
  difficulty: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'cefrLevel', 'difficulty']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ==================== TypeScript Types ====================
export type KeyPoint_Type = z.infer<typeof KeyPoint_Schema>;
export type GrammarExample_Type = z.infer<typeof GrammarExample_Schema>;
export type CommonMistake_Type = z.infer<typeof CommonMistake_Schema>;
export type GrammarNote_Create_Type = z.infer<typeof GrammarNote_Create_Schema>;
export type GrammarNote_Update_Type = z.infer<typeof GrammarNote_Update_Schema>;
export type GrammarNote_Query_Type = z.infer<typeof GrammarNote_Query_Schema>;

export type FillBlankOption_Type = z.infer<typeof FillBlankOption_Schema>;
export type MultipleChoiceOption_Type = z.infer<typeof MultipleChoiceOption_Schema>;
export type MultipleChoiceQuestion_Type = z.infer<typeof MultipleChoiceQuestion_Schema>;
export type GrammarExercise_Create_Type = z.infer<typeof GrammarExercise_Create_Schema>;
export type GrammarExercise_Update_Type = z.infer<typeof GrammarExercise_Update_Schema>;
export type GrammarExercise_Query_Type = z.infer<typeof GrammarExercise_Query_Schema>;

// ==================== Grammar Note Type ====================
export type GrammarNote_Type = {
  _id?: string;
  userId: string;
  title: string;
  category: string;
  cefrLevel?: string;
  content: string;
  keyPoints?: KeyPoint_Type[];
  examples?: GrammarExample_Type[];
  commonMistakes?: CommonMistake_Type[];
  relatedNotes?: string[];
  visualDiagram?: string;
  tags?: string[];
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// ==================== Grammar Exercise Type ====================
export type GrammarExercise_Type = {
  _id?: string;
  userId: string;
  title: string;
  type: string;
  grammarNoteId?: string;
  question: string;
  fillBlankOptions?: FillBlankOption_Type[];
  multipleChoiceQuestions?: MultipleChoiceQuestion_Type[];
  multipleChoiceOptions?: MultipleChoiceOption_Type[]; // Legacy support
  correctAnswer?: string;
  alternativeAnswers?: string[];
  explanation: string;
  cefrLevel?: string;
  difficulty?: string;
  tags?: string[];
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// ==================== List Response Types ====================
export type GrammarNote_ListResponse_Type = {
  notes: GrammarNote_Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GrammarExercise_ListResponse_Type = {
  exercises: GrammarExercise_Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

