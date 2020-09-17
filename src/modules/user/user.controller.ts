import { Controller, Post, Res, Body } from '@nestjs/common';
import { UserService } from './user.service';

import { CreateUserDTO } from '../dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Res() res, @Body() createUserDTO: CreateUserDTO) {
    this.userService.create(createUserDTO);
    res.status(201).json({
      ok: true,
      message: 'received',
    });
  }
}
