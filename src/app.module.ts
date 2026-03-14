import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { DrugModule } from './modules/drug/drug.module';
import { DiseaseModule } from './modules/diseases/diseases.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { PatientProfileModule } from './modules/patient-profile/patient-profile.module';
import { PatientAllergyModule } from './modules/patient-allergy/patient-allergy.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { DeviceTokensModule } from './modules/device-tokens/device-tokens.module';
import { PushModule } from './modules/push/push.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from './common/cache/cache.module';


@Module({
  imports: [
    // ── Config ────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Database ──────────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_HOST'),
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
    QueueModule,
    NotificationsModule,
    EmailModule,
    DeviceTokensModule,
    PushModule,
    RedisModule,
    CacheModule,
  ],
})
export class AppModule {}