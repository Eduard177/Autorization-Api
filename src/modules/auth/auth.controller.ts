import { Body, Controller, Patch, Post, Res } from '@nestjs/common';
import { ForgetPasswordDTO, UserDTO } from '../dto/user.dto';
import { AuthService } from '../auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('login')
    async loginUser(@Res() res, @Body() userDTO: UserDTO) {
      await this.authService.getAuthenticatedUser(userDTO.email, userDTO.id, userDTO.password);
      res.status(201).json({
        statusCode: 201,
        message: 'User Exist',
      });
    }
    @Post('send-email')
    async SendEmail(@Res() res, @Body() userDTO: UserDTO) {
      await this.authService.sendEmail(userDTO.email);
      res.status(200).json({
        statusCode: 200,
        message: 'User Exist',
      });
    }
    @Patch('password/new')
    async forgetPassword(@Res() res, @Body() forgetPasswordDTO: ForgetPasswordDTO ){
      await this.authService.forgetPassword(forgetPasswordDTO);
      res.status(200).json({
        statusCode:200,
        message: 'change your passowrd'
      })
    }}
