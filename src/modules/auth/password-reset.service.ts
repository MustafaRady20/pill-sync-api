import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  PasswordResetCode,
  PasswordResetCodeDocument,
} from './verification/schema/password-reset.schema';
import { EmailService } from 'src/infrastructure/email/email.service';
import { passwordResetEmailTemplate } from 'src/infrastructure/email/templates/password-reset.template';
import { UsersService } from '../users/users.service';

const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel(PasswordResetCode.name)
    private readonly passwordResetModel: Model<PasswordResetCodeDocument>,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security, don't reveal if user exists
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return;
    }

    // Invalidate any existing unused codes for this user
    await this.passwordResetModel.deleteMany({
      userId: user._id,
      used: false,
    });

    // Generate a 6-digit numeric code
    const plainCode = crypto.randomInt(100000, 999999).toString();

    // Hash before storing
    const hashedCode = await (bcrypt.hash(plainCode, 10) as Promise<string>);

    await this.passwordResetModel.create({
      userId: user._id,
      code: hashedCode,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    });

    await this.emailService.sendEmail(
      email,
      'Password Reset Request',
      passwordResetEmailTemplate(plainCode),
    );

    this.logger.log(`Password reset code sent to ${email}`);
  }

  async resetPassword(
    email: string,
    plainCode: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const record = await this.passwordResetModel.findOne({
      userId: user._id,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new BadRequestException(
        'No active password reset code found or code expired. Please request a new one.',
      );
    }

    // Brute-force guard
    if (record.attempts >= MAX_ATTEMPTS) {
      await record.deleteOne();
      throw new BadRequestException(
        'Too many incorrect attempts. Please request a new code.',
      );
    }

    const isMatch = await (bcrypt.compare(
      plainCode,
      record.code,
    ) as Promise<boolean>);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();

      const remaining = MAX_ATTEMPTS - record.attempts;
      throw new BadRequestException(
        `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      );
    }

    // Hash new password
    const hashedNewPassword = await (bcrypt.hash(
      newPassword,
      10,
    ) as Promise<string>);
    await this.usersService.updatePassword(
      user._id.toString(),
      hashedNewPassword,
    );

    // Mark as used
    record.used = true;
    await record.save();

    this.logger.log(`Password reset successfully for user ${user.email}`);
  }
}
