import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { VerificationCode, VerificationCodeDocument } from './schema/verification.code.schema';
import { EmailService } from 'src/modules/email/email.service';
import { verificationEmailTemplate } from 'src/modules/email/templates/verification.template';

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5; // max wrong guesses before the code is invalidated

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectModel(VerificationCode.name)
    private readonly verificationModel: Model<VerificationCodeDocument>,

    private readonly emailService: EmailService ,
  ) {}

  // ─── Send ────────────────────────────────────────────────────────────────────

  async sendVerificationCode(userId: string, email: string): Promise<void> {
    // Invalidate any existing unused codes for this user
    await this.verificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
      used: false,
    });

    // Generate a 6-digit numeric code
    const plainCode = crypto
      .randomInt(100_000, 999_999)
      .toString();

    // Hash before storing — never store plain codes
    const hashedCode = await bcrypt.hash(plainCode, 10);

    await this.verificationModel.create({
      userId: new Types.ObjectId(userId),
      code: hashedCode,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    });

    await this.emailService.sendEmail(
      email,
      'Your verification code',
      verificationEmailTemplate(plainCode),
    );

    this.logger.log(`Verification code sent to ${email}`);
  }

  // ─── Verify ──────────────────────────────────────────────────────────────────

  async verifyCode(userId: string, plainCode: string): Promise<void> {
    const record = await this.verificationModel.findOne({
      userId: new Types.ObjectId(userId),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new NotFoundException(
        'No active verification code found. Please request a new one.',
      );
    }

    // Brute-force guard
    if (record.attempts >= MAX_ATTEMPTS) {
      await record.deleteOne();
      throw new BadRequestException(
        'Too many incorrect attempts. Please request a new code.',
      );
    }

    const isMatch = await bcrypt.compare(plainCode, record.code);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();

      const remaining = MAX_ATTEMPTS - record.attempts;
      throw new BadRequestException(
        `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      );
    }

    // Mark as used so it can't be replayed
    record.used = true;
    await record.save();

    this.logger.log(`Email verified for user ${userId}`);
  }
}