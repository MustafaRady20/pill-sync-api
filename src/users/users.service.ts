import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, AuthProvider } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/register.dto ';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) { }

  async create(
    dto: RegisterDto
  ): Promise<UserDocument> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      provider: AuthProvider.LOCAL,
    });
    return user.save();
  }

  // ─── Google Sign-In ────────────────────────────────────────────────────────
  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
  }): Promise<UserDocument> {
    let user = await this.userModel.findOne({ googleId: profile.googleId });
    if (user) return user;

    user = await this.userModel.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.googleId;
      user.provider = AuthProvider.GOOGLE;
      if (!user.avatar) user.avatar = profile.avatar;
      return user.save();
    }

    const newUser = new this.userModel({
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      googleId: profile.googleId,
      provider: AuthProvider.GOOGLE,
    });
    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async updateRefreshToken(
    userId: string,
    token: string | null,
  ): Promise<void> {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed });
  }

  async validateRefreshToken(
    userId: string,
    token: string,
  ): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('+refreshToken');
    if (!user?.refreshToken) return false;
    return bcrypt.compare(token, user.refreshToken);
  }


  async markEmailVerified(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { isEmailVerified: true },
    });
  }
}