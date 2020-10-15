import { Model } from 'mongoose';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from '../user/schemas/user.schema';
import { ForgetPasswordDTO} from '../dto/user.dto';
import { compareSync, hashSync } from 'bcrypt';
import { MailManagerService } from '../auth/mail-manager/mail-manager.service'

import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
      @InjectModel(User.name)
      private userModel: Model<User>,
      private readonly _jwtService:JwtService,
      private readonly mailManagerService: MailManagerService
      ) {}

    async getAuthenticatedUser(email: string, id: number,password: string):Promise<{token: string}> {
      await this.userExist(email)
      const user = await this.getByEmail(email, id);
      await this.loginTries(email, password, user);
      return await this.generateToken(user);

    };   
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
      };
      
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
        
      };
      async getById(id: number) {
        const userId = await this.userModel.findOne({id: id});
        if (userId) {
          return userId;
        }
        throw new NotFoundException('User with this id does not exist');
      };
      async userExist(email: string){
        const userExist = await this.userModel.findOne({email})
        if(!userExist.status){
            throw new NotFoundException("This user has be deleted");
        }
        return;
      };

      async loginTries(email: string, password: string, user:User){
        const isPasswordMatching = compareSync(password, user.password);
      
        if(user.loginTries >= 5){
            user.isBlocked = true;
            user.save();
            this.mailManagerService.sendEmailToMaxTries(email)
            throw new BadRequestException('Maximum number of attempts');
          }
  
          if (!isPasswordMatching) {
            user.loginTries = user.loginTries + 1;
            user.save();
            throw new NotFoundException('Wrong credential provided');
          }
          user.isBlocked = false;
          user.loginTries = 0;
          user.save();
      };

      async generateToken(user: User):Promise<{token: string}>{
        const payload: IJwtPayload = {
          name: user.name,
          email: user.email,
          id: user.id
        }
        const token = this._jwtService.sign(payload);
        return {token};
      };

}
