import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { DrugModule } from './drug/drug.module';
import { DiseaseModule } from './diseases/diseases.module';
import { InteractionsModule } from './interactions/interactions.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';


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
  ],
})
export class AppModule {}