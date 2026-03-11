import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from 'src/users/users.module';
import { VerificationService } from './verification/verification.service';
import { VerificationCode, VerificationCodeSchema } from './verification/schema/verification.code.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),
    UserModule,
    EmailModule,
    PassportModule,
    JwtModule.register({}), 
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, VerificationService],
})
export class AuthModule {}