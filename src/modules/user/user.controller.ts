import { Controller, Post, Res, Body, Patch, Get,} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, UserDTO } from '../dto/user.dto';
;

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async createUser(@Res() res, @Body() createUserDTO: CreateUserDTO) {
    await this.userService.create(createUserDTO);
    res.status(201).json({
      statusCode: 201,
      message: 'User Created',
    });
  };
  @Get('profile')
  async getUser( @Body() userDto: UserDTO ){
   const user = await this.userService.getUserByEmail(userDto.email)  
   return user;
  }
  @Patch('delete')
  async deleteUser(@Res() res, @Body() userDto: UserDTO){
    await this.userService.deleteUser(userDto.email, userDto.password)
    res.status(200).json({
      statusCode: 200,
      message: 'User Delete',
    });
  };
  @Patch('update')
  async updateUser(@Res() res, @Body() userDTO: UserDTO){
    await this.userService.updateUser(userDTO.email,userDTO.password, userDTO.name)
    res.status(200).json({
      statusCode: 200,
      message: 'User Update',
    });
  };
}
