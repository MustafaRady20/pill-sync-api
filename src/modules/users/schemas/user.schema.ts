import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'user@gmail.com' })
  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @Prop({ unique: true, index: true, sparse: true, trim: true })
  phoneNumber?: string;

  @Prop({ select: false })
  password?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.PATIENT })
  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.PATIENT,
    index: true,
  })
  role: UserRole;

  @ApiProperty({ example: 'google-oauth-id', required: false })
  @Prop({ index: true, sparse: true }) // sparse so null values don't conflict on unique
  googleId?: string;

  @ApiProperty({ example: 'https://avatar.url', required: false })
  @Prop()
  avatar?: string;

  @ApiProperty({ enum: AuthProvider, default: AuthProvider.LOCAL })
  @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @ApiProperty({ example: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  hasCompletedOnboarding: boolean;

  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
