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
import { NotificationsModule } from './infrastructure/notifications/notifications.module';
import { EmailModule } from './infrastructure/email/email.module';
import { DeviceTokensModule } from './infrastructure/device-tokens/device-tokens.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CacheModule } from './common/cache/cache.module';
import { PushModule } from './infrastructure/push/push.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { FileUploadModule } from './infrastructure/file-upload/file-upload.module';
import { NotesModule } from './modules/notes/notes.module';
import { VitalSignsModule } from './modules/vital-sign/vital-sign.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_HOST'),
      }),
    }),

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
    AppointmentsModule,
    ComplaintsModule,
    VitalSignsModule,
    FileUploadModule,
    NotesModule,
  ],
})
export class AppModule {}