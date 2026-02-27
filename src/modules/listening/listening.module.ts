import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListeningAudio, ListeningAudioSchema } from './listening-audio.schema';
import { ListeningAudioController } from './listening-audio.controller';
import { ListeningUploadController } from './listening-upload.controller';
import { ListeningAudioService } from './listening-audio.service';
import { ListeningAudioMongoService } from './services/listening-audio-mongo.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ListeningAudio.name, schema: ListeningAudioSchema },
    ]),
    AuthModule,
  ],
  controllers: [ListeningAudioController, ListeningUploadController],
  providers: [ListeningAudioService, ListeningAudioMongoService],
  exports: [ListeningAudioService],
})
export class ListeningModule {}
