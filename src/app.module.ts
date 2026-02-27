import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ArticleModule } from './modules/article/article.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { SpeakingModule } from './modules/speaking/speaking.module';
import { ListeningModule } from './modules/listening/listening.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      // MongoDB Atlas connection options
      // The connection string should include: mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority
      connectionFactory: async (connection) => {
        const logger = new Logger('MongoDB');
        
        // Log connection details
        const dbName = connection.db?.databaseName || 'unknown';
        console.log(`Connecting to database: ${dbName}`);
        logger.log(`Connecting to database: ${dbName}`);
        logger.log(`Connection URI: ${process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@') || 'not set'}`);
        
        connection.on('connected', () => {
          logger.log(`MongoDB Atlas connected successfully to database: ${dbName}`);
        });
        connection.on('disconnected', () => {
          logger.warn('MongoDB Atlas disconnected');
        });
        connection.on('error', (error: any) => {
          logger.error('MongoDB Atlas connection error: ', error);
        });
        
        // Send a ping to confirm successful connection
        try {
          await connection.db.admin().command({ ping: 1 });
          logger.log(`Pinged MongoDB Atlas deployment. Database: ${dbName}, Connection confirmed!`);
          
          // List collections to verify
          const collections = await connection.db.listCollections().toArray();
          logger.log(`Available collections: ${collections.map(c => c.name).join(', ') || 'none'}`);
        } catch (error) {
          logger.warn('Could not ping MongoDB Atlas:', error);
        }
        
        return connection;
      },
    }),
    UserModule, // Import UserModule directly to ensure schema is registered
    ArticleModule, // Import ArticleModule
    VocabularyModule, // Import VocabularyModule
    GrammarModule, // Import GrammarModule
    SpeakingModule, // Import SpeakingModule
    ListeningModule, // Import ListeningModule
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
