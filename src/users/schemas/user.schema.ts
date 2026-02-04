import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty({ example: 'uuid-string' })
  _id: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ nullable: true })
  password?: string;

  @ApiProperty({ example: 'John', required: false })
  @Prop()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @Prop()
  lastName?: string;

  @ApiProperty({ example: 'google-oauth-id', required: false })
  @Prop({ index: true })
  googleId?: string;

  @ApiProperty({ example: 'https://avatar.url', required: false })
  @Prop()
  avatarUrl?: string;

  @ApiProperty({ example: 'local', enum: ['local', 'google'] })
  @Prop({ default: 'local' })
  provider: 'local' | 'google';

  @ApiProperty({ example: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isEmailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
