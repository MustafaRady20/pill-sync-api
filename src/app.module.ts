import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { DrugModule } from './drug/drug.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PatientAnswersModule } from './patient-answers/patient-answers.module';
import { SharedModule } from './shared-module/shared-module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DATABASE_HOST'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    DrugModule,
    OnboardingModule,
    PatientAnswersModule,
    SharedModule,
  ],
})
export class AppModule {}
