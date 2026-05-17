import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceToken, DeviceTokenDocument } from './schema/device-token.schema';
import { SaveDeviceTokenDto } from './dto/device.dto';

@Injectable()
export class DeviceTokensService {
  private readonly logger = new Logger(DeviceTokensService.name);

  constructor(
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
  ) {}

  async save(dto: SaveDeviceTokenDto): Promise<DeviceTokenDocument> {
    const token = await this.deviceTokenModel.findOneAndUpdate(
      { token: dto.token },
      { $set: dto },
      { upsert: true, new: true },
    );
    this.logger.log(`Device token saved for user ${dto.userId}`);
    return token;
  }

  async findByUserId(userId: string): Promise<DeviceTokenDocument[]> {
    return this.deviceTokenModel.find({ userId }).lean().exec();
  }

  async removeByToken(token: string): Promise<void> {
    await this.deviceTokenModel.deleteOne({ token }).exec();
  }
}
