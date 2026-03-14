import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import * as userSchema from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto ';
import { LocalAuthGuard } from './guards/local auth.guard';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';
import { SendVerificationDto, VerifyEmailDto } from './dto/verifiyEmail.dto';
import { VerificationService } from './verification/verification.service';
import { UsersService } from 'src/modules/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,

  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit the 6-digit code to verify email' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend a fresh verification code' })
  resendCode(@Body() dto: SendVerificationDto) {
    return this.authService.resendVerificationCode(dto.email);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    console.log('Logging in user:', dto.email);
    return this.authService.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto.idToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: userSchema.UserDocument) {
    return this.authService.logout(user._id.toString());
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const payload = this.decodeToken(dto.refreshToken);
    return this.authService.refreshTokens(payload.sub, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@CurrentUser() user: userSchema.UserDocument) {
    return this.authService.getProfile(user._id.toString());
  }

  private decodeToken(token: string) {
    const base64 = token.split('.')[1];
    return JSON.parse(Buffer.from(base64, 'base64').toString());
  }
}
