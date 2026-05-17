import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeviceTokensService } from './device-tokens.service';
import { SaveDeviceTokenDto } from './dto/device.dto';

@ApiTags('Devices')
@Controller('devices')
export class DeviceTokensController {
  constructor(private readonly deviceTokensService: DeviceTokensService) {}

  @Post('token')
  @ApiOperation({ summary: 'Register or update a device token' })
  saveToken(@Body() dto: SaveDeviceTokenDto) {
    return this.deviceTokensService.save(dto);
  }

  @Delete('token/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a device token (e.g. on logout)' })
  removeToken(@Param('token') token: string) {
    return this.deviceTokensService.removeByToken(token);
  }
}
