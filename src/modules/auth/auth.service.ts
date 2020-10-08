import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { ForgetPasswordDTO} from '../dto/user.dto';
import { compareSync, hashSync } from 'bcrypt';

import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
      @InjectModel(User.name)
      private userModel: Model<User>,
      private readonly _jwtService:JwtService,
      ) {}

    async getAuthenticatedUser(email: string, id: number,password: string):Promise<{token: string}> {
        const user = await this.getByEmail(email, id);

        const isPasswordMatching = await compareSync(password, user.password);

        if(user.loginTries >= 5){
          user.isBlocked = true;
          user.save();
          this.sendEmailToMaxTries(email)
         throw new HttpException(
            'Maximum number of attempts',
            HttpStatus.BAD_REQUEST,
           );
        }

        if (!isPasswordMatching) {
          user.loginTries = user.loginTries + 1;
          user.save();
         throw new HttpException(
            'Wrong credential provided',
            HttpStatus.BAD_REQUEST,
          );
        }

        const payload: IJwtPayload = {
          name: user.name,
          email: user.email,
          id: user.id
        }
        user.isBlocked = false;
        user.loginTries = 0;
        user.save();
        const token = await this._jwtService.sign(payload);
        return {token};

      } 
    
      /////////////////////Did you forget your password?/////////////////////
    
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
      async forgetPassword(forgetPasswordDTO: ForgetPasswordDTO){
        const user = await this.userModel.findOne({ email: forgetPasswordDTO.email });
        if(forgetPasswordDTO.newPassword == ""){
          throw new HttpException(
            'Password cannot be empty',
            HttpStatus.BAD_REQUEST,
          );
        }
        if(user){
            this.userModel.updateOne({email:forgetPasswordDTO.email},{
              password : hashSync(forgetPasswordDTO.newPassword,10)
            },(err)=>{
              if (err) {
                throw new HttpException(
                  'Wrong credential provided',
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              }
            })
            throw new HttpException(
              'Your password is changed',
              HttpStatus.OK,)
          
        }else{
          throw new HttpException(
            'Wrong credential provided',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
      /////////////////////Methos/////////////////////
    
      async sendEmailToForget(forgetPasswordDTO: ForgetPasswordDTO) {
       const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: 'judson76@ethereal.email',
            pass: 'HQuUDwtRXwMhAeT8GT'
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
             user: 'judson76@ethereal.email',
             pass: 'HQuUDwtRXwMhAeT8GT'
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
    
      async getByEmail(email: string, id: number) {
        const user = await this.userModel.findOne({ email: email });
        if (user) {
          if(user.id == id){
            new HttpException('User Exist', HttpStatus.OK)
            return user;
          }else{
            throw new HttpException('Wrong credential provided', HttpStatus.NOT_FOUND)
          }
    
        }
        throw new HttpException(
          'Wrong credential provided',
          HttpStatus.NOT_FOUND,
        );
      }
      async getById(id: number) {
        const userId = await this.userModel.findOne({id: id});
        if (userId) {
          return userId;
        }
        throw new HttpException(
          'User with this id does not exist',
          HttpStatus.NOT_FOUND,
        );
      }
      async verifyPassword(password: string, hashedPassword: string) {
        const isPasswordMatching = await compareSync(password, hashedPassword);
        if (!isPasswordMatching) {
          new HttpException(
            'Wrong credential provided',
            HttpStatus.BAD_REQUEST,
          );
          return false;  
        }
        return true;
      }

      contentHtmlForget = `
    <h1><b>Change your password</b></h1>
    <a href="http://localhost:3000/api/users/password/new"><b>New Password</b></a>
    `
    
    contentHtmlMaxTries= `
    <h1><b>someone is trying to enter your account, Is you?</b></h1>
    `
}
