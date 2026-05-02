import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, AuthProvider } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/modules/auth/dto/register.dto ';
import { MedicalCondition, UserProfile, UserProfileDocument } from './schemas/userProfile.schema';
import { AllergiesDto, MedicalConditionDto, MedicalHistoryDto, PersonalInfoDto } from './dto/onboarding.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    
    private userModel: Model<UserDocument>,
     @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
 
  ) { }

  async create(
    dto: RegisterDto
  ): Promise<UserDocument> {
    const existingEmail = await this.findByEmail(dto.email);
    if (existingEmail) throw new ConflictException('Email already in use');

    if (dto.phoneNumber) {
      const existingPhone = await this.userModel.findOne({ phoneNumber: dto.phoneNumber });
      if (existingPhone) throw new ConflictException('Phone number already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      email: dto.email,
      phoneNumber: dto.phoneNumber,
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

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phoneNumber: identifier },
      ],
    }).select('+password');
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


  // onboarding
  private async getProfileOrFail(userId: string): Promise<UserProfileDocument> {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile) throw new NotFoundException('Profile not found. Complete step 1 first.');
    return profile;
  }
 
  private async guardEmailVerified(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found.');
    if (!user.isEmailVerified)
      throw new BadRequestException('Please verify your email before completing your profile.');
  }
 
  // ─── Step 1: Personal Info ────────────────────────────────────────────────
 
  async savePersonalInfo(userId: string, dto: PersonalInfoDto): Promise<UserProfileDocument> {
    await this.guardEmailVerified(userId);
 
    const existing = await this.profileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existing && existing.onboardingStep >= 1) {
      // Allow re-saving step 1 (user might go back and edit)
      Object.assign(existing, {
        ...dto,
        birthDate: new Date(dto.birthDate),
      });
      return existing.save();
    }
 
    const profile = new this.profileModel({
      userId: new Types.ObjectId(userId),
      ...dto,
      birthDate: new Date(dto.birthDate),
      onboardingStep: 1,
    });
 
    return profile.save();
  }
 
  // ─── Step 2: Allergies ────────────────────────────────────────────────────
 
  async saveAllergies(userId: string, dto: AllergiesDto): Promise<UserProfileDocument> {
    const profile = await this.getProfileOrFail(userId);
 
    profile.drugAllergies = {
      predefined: dto.drugAllergies?.predefined ?? [],
      custom: dto.drugAllergies?.custom ?? [],
    };
    profile.foodAllergies = {
      predefined: dto.foodAllergies?.predefined ?? [],
      custom: dto.foodAllergies?.custom ?? [],
    };
    profile.onboardingStep = Math.max(profile.onboardingStep, 2);
 
    return profile.save();
  }
 
  // ─── Step 3: Medical History ──────────────────────────────────────────────
 
  async saveMedicalHistory(userId: string, dto: MedicalHistoryDto): Promise<{ profile: UserProfileDocument }> {
    const profile = await this.getProfileOrFail(userId);
 
    profile.hasConditions = dto.hasConditions;
    profile.conditions = dto.hasConditions ? (dto.conditions as MedicalCondition[] ?? []) : [];
    profile.onboardingStep = 3;
 
    await profile.save();
 
    // Mark user onboarding as complete
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { hasCompletedOnboarding: true },
    });
 
    return { profile };
  }
 
  // ─── Get current profile ──────────────────────────────────────────────────
 
  async getProfile(userId: string): Promise<UserProfileDocument | null> {
    return this.profileModel.findOne({ userId: new Types.ObjectId(userId) }).populate("userId");
  }
 
  // ─── Update a single condition (e.g. adding follow-up answers later) ──────
 
  async updateCondition(
    userId: string,
    conditionIndex: number,
    updates: Partial<MedicalConditionDto>,
  ): Promise<UserProfileDocument> {
    const profile = await this.getProfileOrFail(userId);
 
    if (conditionIndex < 0 || conditionIndex >= profile.conditions.length) {
      throw new BadRequestException('Invalid condition index.');
    }
 
    Object.assign(profile.conditions[conditionIndex], updates);
    profile.markModified('conditions'); // Required for Mixed/nested array mutation
    return profile.save();
  }
}