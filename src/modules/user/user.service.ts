import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDTO,} from '../dto/user.dto';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDTO: CreateUserDTO): Promise<User> {
      const createdUser = await this.userModel.create(createUserDTO);
      await createdUser.save();
      return;
  };

  async getUserById(id: number) {
    const userId = await this.userModel.findOne({id: id});
    if (userId) {
      return userId;
    }
    throw BadRequestException 
    ;
  }
}