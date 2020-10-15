import { Body, Controller, Patch, Get} from '@nestjs/common';
import { ForgetPasswordDTO, UserDTO } from '../dto/user.dto';
import { AuthService } from '../auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Get('login')
    async loginUser( @Body() userDTO: UserDTO) {
     return await this.authService.getAuthenticatedUser(userDTO.email, userDTO.id, userDTO.password);
    }
    @Patch('password/new')
    async forgetPassword( @Body() forgetPasswordDTO: ForgetPasswordDTO ){
      await this.authService.forgetPassword(forgetPasswordDTO);
    }}
