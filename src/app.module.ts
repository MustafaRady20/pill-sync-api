import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { DrugModule } from './drug/drug.module';
import { DiseaseModule } from './diseases/diseases.module';
import { InteractionsModule } from './interactions/interactions.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';
import { PatientAllergyModule } from './patient-allergy/patient-allergy.module';


@Module({
  imports: [
    // ── Config ────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Database ──────────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    // ── Feature Modules ───────────────────────────────────────────────────
    AuthModule,
    UserModule,
    DrugModule,
    DiseaseModule,
    InteractionsModule,
    OnboardingModule,
    PrescriptionsModule,
    PatientProfileModule,
    PatientAllergyModule,
  ],
})
export class AppModule {}