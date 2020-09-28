import { Controller, Post, Res, Body,} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

import { CreateUserDTO, } from '../dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post('register')
  async createUser(@Res() res, @Body() createUserDTO: CreateUserDTO) {
    await this.userService.create(createUserDTO);
    res.status(201).json({
      statusCode: 201,
      message: 'User Created',
    });
  }
}
