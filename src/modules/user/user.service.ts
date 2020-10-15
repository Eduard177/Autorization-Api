import { Model } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDTO,} from '../dto/user.dto';
import { genSaltSync, hashSync } from 'bcrypt';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  
  async getUserById(id: number): Promise<User> {
    if(!id){
      throw new BadRequestException ('id must be send');
    }
    const userId: User = await this.userModel.findOne({id});
    if (!userId) {
      return userId;
    }
    throw new BadRequestException('id is already use');
  }

  async getUserByEmail(email: string): Promise<User> {
    if(!email){
      throw new BadRequestException ('email must be send');
    }
    const userEmail: User = await this.userModel.findOne({email});
    if (!userEmail) {
      return userEmail;
    }
    throw new BadRequestException('email is already use');
  } 
  
  async create(createUserDTO: CreateUserDTO): Promise<User> {
      await this.getUserById(createUserDTO.id);
      await this.getUserByEmail(createUserDTO.email);
      const createdUser = await this.userModel.create(createUserDTO);
      createdUser.password = await this.hash(createUserDTO.password);
      await createdUser.save();
      return;
  };

  async hash(data: string):Promise<string>{
    const salt = genSaltSync(10);
    const hash = hashSync(data, salt);
    return hash;
  }
  async deleteUser(email: string){
    const userExist = await this.userModel.findOne({email})
    if(!userExist.status){
      throw new NotFoundException()
    }
    await this.userModel.updateOne({email},{status:false})
  }
  
}