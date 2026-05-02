import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'identifier' });
  }

  async validate(identifier: string, password: string) {
    console.log(identifier)
    console.log(password)

    const user = await this.authService.validateUser(identifier, password);
    console.log("log in user",user)
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}