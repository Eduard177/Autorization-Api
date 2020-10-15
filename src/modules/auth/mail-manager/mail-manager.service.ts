import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ForgetPasswordDTO } from 'src/modules/dto/user.dto';

import * as nodemailer from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/modules/user/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class MailManagerService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        ) {}
    async sendEmail(forgetPasswordDTO: ForgetPasswordDTO){
        const user = await this.userModel.findOne({ email: forgetPasswordDTO.email });
        if(user){
          await this.sendEmailToForget(forgetPasswordDTO)
          throw new HttpException(
           `Send Email to ${forgetPasswordDTO.email}`,
            HttpStatus.OK,
          );
        }else{
          throw new HttpException(
            'User with this email does not exist',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      async sendEmailToForget(forgetPasswordDTO: ForgetPasswordDTO) {
        const transporter = nodemailer.createTransport({
           host: "smtp.ethereal.email",
           port: 587,
           secure: false,
           auth: {
             user: 'peyton.kunde@ethereal.email',
             pass: 'Txf3tBQdcn8Hwg6JnC'
           }
         });
     
         const info = await transporter.sendMail({
           from: "'MMG enterprise' <freida91@ethereal.email>",
           to: `${forgetPasswordDTO.email}`,
           subject: 'forget password',
           html: this.contentHtmlForget
         });
     
         console.log('Message sent', info.messageId);
       }
 
       async sendEmailToMaxTries(email: string) {
         const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: 'peyton.kunde@ethereal.email',
              pass: 'Txf3tBQdcn8Hwg6JnC'
            }
          });
      
          const info = await transporter.sendMail({
            from: "'MMG enterprise' <freida91@ethereal.email>",
            to: `${email}`,
            subject: 'Intruder?',
            html: this.contentHtmlMaxTries
          });
      
          console.log('Message sent', info.messageId);
        }

        
      contentHtmlForget = `
      <h1><b>Change your password</b></h1>
      <a href="http://localhost:3000/api/users/password/new"><b>New Password</b></a>
      `
      
      contentHtmlMaxTries= `
      <h1><b>someone is trying to enter your account, Is you?</b></h1>
      `
}
