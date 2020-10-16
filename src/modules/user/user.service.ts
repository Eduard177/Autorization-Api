import { Model } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDTO,} from '../dto/user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) 
  private userModel: Model<User>,
  ) {} 
  async create(createUserDTO: CreateUserDTO): Promise<User> {
    await this.getUserById(createUserDTO.id);
    await this.userEmail(createUserDTO.email);
    const createdUser = await this.userModel.create(createUserDTO);
    createdUser.password = await this.hash(createUserDTO.password);
    await createdUser.save();
      return;
  };
  async updateUser(email: string, password: string ,name: string){
    const user = await this.userExist(email);
    await this.hasUserBeenDeleted(email);
    await this.verifyPassword(password,user.password);
    await this.userModel.updateOne(user,{name: name});
  };


  async deleteUser(email: string, password: string){
    const user = await this.userExist(email);
    await this.hasUserBeenDeleted(email);
    await this.verifyPassword(password,user.password);
    await this.userModel.updateOne({email},{status:false});
  };

  async getUserById(id: number): Promise<User> {
    if(!id){
      throw new BadRequestException ('id must be send');
    };
    const userId: User = await this.userModel.findOne({id});
    if (!userId) {
      return userId;
    };
    throw new BadRequestException('id is already use');
  };

  async userEmail(email: string): Promise<User> {
    if(!email){
      throw new BadRequestException ('email must be send');
    };
    const userEmail: User = await this.userModel.findOne({email});
    if (!userEmail) {
      return userEmail;
    };
    throw new BadRequestException('email is already use');
  };

  async getUserByEmail(email: string){
    if(!email){
      throw new BadRequestException ('email must be send');
    };
    await this.userExist(email);
    await this.hasUserBeenDeleted(email);
    const user = await this.userModel.findOne({email});
    const profile = 
     [{name:user.name,
       email:user.email,
       img:user.img,
       status:user.status,
       id: user.id,
       isBlocked:user.isBlocked
     }]
    return profile
  }

  async userExist(email: string){
    const userExist = await this.userModel.findOne({email})
    if(!userExist){
      throw new NotFoundException()
    };
    return userExist;
  };

  async hasUserBeenDeleted(email: string){
    const userExist = await this.userModel.findOne({email})
    if(!userExist.status){
      throw new NotFoundException('this user has been removed')
    };
    return;
  };
  
  async verifyPassword(password: string, hashedPassword: string) {
    const isPasswordMatching = compareSync(password, hashedPassword);
    if (!isPasswordMatching) {
    throw new BadRequestException('Incorrect password');
    };
    return;
  };

  async hash(data: string):Promise<string>{
    const salt = genSaltSync(10);
    const hash = hashSync(data, salt);
    return hash;
  };
}