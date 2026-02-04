import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let hashedPassword: string | undefined;
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument |null> {
     return this.userModel.findOne({ email }).exec();
    
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
   return  this.userModel.findOne({ googleId }).exec();
   
    
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOrCreateGoogleUser(profile: any): Promise<User> {
    let user = await this.findByGoogleId(profile.id);

    if (user) {
      return user;
    }

    const email = profile.emails?.[0]?.value;

    // 2️⃣ Try email
    user = await this.findByEmail(email);

    if (user) {
      user.googleId = profile.id;
      user.provider = 'google';
      user.avatarUrl = profile.photos?.[0]?.value;
      user.isEmailVerified = true;

      return user.save();
    }

    const newUser = new this.userModel({
      email,
      googleId: profile.id,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'google',
      isEmailVerified: true,
    });

    return newUser.save();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
