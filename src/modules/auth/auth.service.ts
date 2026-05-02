import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto ';
import { LoginDto } from './dto/login.dto';
import { VerificationService } from './verification/verification.service';
import { VerifyEmailDto } from './dto/verifiyEmail.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly verificationService: VerificationService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByIdentifier(identifier);
    console.log('Validating user:', identifier, 'Found user:', !!user);
    if (!user || !user.password) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  async register(dto: RegisterDto) {
    
    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user);

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );

    await this.verificationService.sendVerificationCode(
      user._id.toString(),
      user.email,
    );

    return {
      user: user.toJSON(),
      ...tokens,
      message: 'Account created. Please check your email for a 6-digit verification code.',
    };
  }


  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified.' };
    }

    await this.verificationService.verifyCode(user._id.toString(), dto.code);

  
    await this.usersService.markEmailVerified(user._id.toString());

    return { message: 'Email verified successfully.' };
  }


  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('User not found.');
    if (user.isEmailVerified) throw new BadRequestException('Email already verified.');

    await this.verificationService.sendVerificationCode(
      user._id.toString(),
      user.email,
    );

    return { message: 'A new verification code has been sent to your email.' };
  }


async login(dto: LoginDto) {
  const user = await this.validateUser(dto.identifier, dto.password);
  if (!user) throw new UnauthorizedException();
 
  const tokens = await this.generateTokens(user);
  await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

  const profile = await this.usersService.getProfile(user._id.toString());

  return {
    user: user.toJSON(),
    ...tokens,
    onboardingStep: profile?.onboardingStep ?? 0,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
  };
}

  async googleAuth(idToken: string) {
    const ticket = await this.googleClient
      .verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      })
      .catch(() => {
        throw new BadRequestException('Invalid Google token');
      });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new BadRequestException('Could not extract profile from Google token');
    }

    const user = await this.usersService.findOrCreateGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email.split('@')[0],
      avatar: payload.picture || "",
    });

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return { user: user.toJSON(), ...tokens };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const isValid = await this.usersService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return user.toJSON();
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}