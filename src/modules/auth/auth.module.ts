import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from 'src/modules/users/users.module';
import { VerificationService } from './verification/verification.service';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './verification/schema/verification.code.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { PasswordResetService } from './password-reset.service';
import {
  PasswordResetCode,
  PasswordResetCodeSchema,
} from './verification/schema/password-reset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerificationCode.name, schema: VerificationCodeSchema },
      { name: PasswordResetCode.name, schema: PasswordResetCodeSchema },
    ]),
    UserModule,
    EmailModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    VerificationService,
    PasswordResetService,
  ],
})
export class AuthModule {}
