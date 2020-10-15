import { Body, Controller, Post } from '@nestjs/common';
import { ForgetPasswordDTO } from 'src/modules/dto/user.dto';
import { MailManagerService } from './mail-manager.service';

@Controller('mail-manager')
export class MailManagerController {
    constructor(private readonly mailManagerService: MailManagerService) {}

    @Post('send-email')
    async SendEmail( @Body() forgetPasswordDTO: ForgetPasswordDTO) {
      await this.mailManagerService.sendEmail(forgetPasswordDTO);
    }
}
