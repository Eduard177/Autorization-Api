import { Body, Controller, Patch, Post, Get} from '@nestjs/common';
import { ForgetPasswordDTO, UserDTO } from '../dto/user.dto';
import { AuthService } from '../auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Get('login')
    async loginUser( @Body() userDTO: UserDTO) {
     return await this.authService.getAuthenticatedUser(userDTO.email, userDTO.id, userDTO.password);
    }
    @Post('send-email')
    async SendEmail( @Body() forgetPasswordDTO: ForgetPasswordDTO) {
      await this.authService.sendEmail(forgetPasswordDTO);
    }
    @Patch('password/new')
    async forgetPassword( @Body() forgetPasswordDTO: ForgetPasswordDTO ){
      await this.authService.forgetPassword(forgetPasswordDTO);
    }}
