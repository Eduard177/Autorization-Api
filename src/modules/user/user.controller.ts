import { Controller, Post, Res, Body } from '@nestjs/common';
import { UserService } from './user.service';

import { CreateUserDTO, UserDTO } from '../dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService ) {}

  @Post('register')
  async createUser(@Res() res, @Body() createUserDTO: CreateUserDTO) {
    await this.userService.create(createUserDTO);
    res.status(201).json({
      statusCode: 201,
      message: 'User Created',
    });
  }
  @Post('login')
  async loginUser(@Res() res, @Body() userDTO: UserDTO) {
    await this.userService.getAuthenticatedUser(userDTO.email, userDTO.id, userDTO.password);
    res.status(201).json({
      statusCode: 201,
      message: 'User Exist',
    });
  }
}
