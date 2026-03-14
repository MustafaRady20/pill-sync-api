import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationResponseDto } from './dtos/notification-response.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and queue a notification' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  create(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.createNotification(dto) as any;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a user' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  getUserNotifications(
    @Param('userId') userId: string,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.getUserNotifications(userId) as any;
  }
}