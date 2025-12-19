import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-template', {
      connectionFactory: async (connection) => {
        const logger = new Logger('MongoDB');
        connection.on('connected', () => {
          logger.log('MongoDB connected successfully');
        });
        connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
        });
        connection.on('error', (error: any) => {
          logger.error('MongoDB connection error: ', error);
        });
        return connection;
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
