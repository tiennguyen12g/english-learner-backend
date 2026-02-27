import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeakingGuide, SpeakingGuideSchema } from './speaking-guide.schema';
import { SpeakingSituation, SpeakingSituationSchema } from './speaking-situation.schema';
import { SpeakingGuideService } from './speaking-guide.service';
import { SpeakingGuideMongoService } from './services/speaking-guide-mongo.service';
import { SpeakingSituationService } from './speaking-situation.service';
import { SpeakingSituationMongoService } from './services/speaking-situation-mongo.service';
import { SpeakingGuideController } from './speaking-guide.controller';
import { SpeakingSituationController } from './speaking-situation.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpeakingGuide.name, schema: SpeakingGuideSchema },
      { name: SpeakingSituation.name, schema: SpeakingSituationSchema },
    ]),
    AuthModule,
  ],
  controllers: [SpeakingGuideController, SpeakingSituationController],
  providers: [
    SpeakingGuideService,
    SpeakingGuideMongoService,
    SpeakingSituationService,
    SpeakingSituationMongoService,
  ],
  exports: [SpeakingGuideService, SpeakingSituationService],
})
export class SpeakingModule {}

