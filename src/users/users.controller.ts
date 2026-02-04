import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }
}