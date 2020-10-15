import { Model } from 'mongoose';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from '../user/schemas/user.schema';
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
      await this.userExist(email)
      const user = await this.getByEmail(email, id);
      const isPasswordMatching = compareSync(password, user.password);
      
      if(user.loginTries >= 5){
          user.isBlocked = true;
          user.save();
          this.sendEmailToMaxTries(email)
          throw new BadRequestException('Maximum number of attempts');
        }

        if (!isPasswordMatching) {
          user.loginTries = user.loginTries + 1;
          user.save();
          throw new NotFoundException('Wrong credential provided');
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
          throw new BadRequestException('Password cannot be empty');
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
          throw new BadRequestException('Wrong credential provided');
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
            throw new NotFoundException('Wrong credential provided');
          }
    
        }
        throw new NotFoundException('Wrong credential provided');
        
      }
      async getById(id: number) {
        const userId = await this.userModel.findOne({id: id});
        if (userId) {
          return userId;
        }
        throw new NotFoundException('User with this id does not exist');
      }
      async verifyPassword(password: string, hashedPassword: string) {
        const isPasswordMatching = compareSync(password, hashedPassword);
        if (!isPasswordMatching) {
          new BadRequestException('Maximum number of attempts');
          return false;  
        }
        return true;
      }

      async userExist(email: string){
        const userExist = await this.userModel.findOne({email})
        if(!userExist.status){
            throw new NotFoundException("This user has be deleted");
        }
        return;
      }

      contentHtmlForget = `
    <h1><b>Change your password</b></h1>
    <a href="http://localhost:3000/api/users/password/new"><b>New Password</b></a>
    `
    
    contentHtmlMaxTries= `
    <h1><b>someone is trying to enter your account, Is you?</b></h1>
    `
}
