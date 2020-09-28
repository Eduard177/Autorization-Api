import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { ForgetPasswordDTO } from '../dto/user.dto';
import { compareSync, hashSync } from 'bcrypt';

import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async getAuthenticatedUser(email: string, id: number,password: string) {
        const user = await this.getByEmail(email, id);
        await this.verifyPassword( password, user.password);
    }
    
      /////////////////////Did you forget your password?/////////////////////
    
      async sendEmail(email: string){
        const user = await this.userModel.findOne({ email: email });
        if(user){
          await this.sendEmailTo()
          throw new HttpException(
            'Send',
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
          
        }else{
          throw new HttpException(
            'Wrong credential provided',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
      /////////////////////Methos/////////////////////
    
      async sendEmailTo() {
       const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: 'timmothy.pagac@ethereal.email',
            pass: 'FbaYAAAMT18UAgy77P'
          }
        });
    
        const info = await transporter.sendMail({
          from: "'MMG enterprise' <freida91@ethereal.email>",
          to: 'eduarpi2001@gmail.com',
          subject: 'forget password',
          html: this.contentHtml
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
          throw new HttpException(
            'Wrong credential provided',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      

      contentHtml = `
    <h1><b>Change your password</b></h1>
    <a href="http://localhost:3000/api/users/password/new"><b>New Password</b></a>
    `
    
}
