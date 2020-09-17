import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { CreateUserDTO } from '../dto/user.dto';
import { hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    try {
      const createdUser = await this.userModel.create(createUserDTO);
      createdUser.password = hashSync(createUserDTO.password, 10);
      await createdUser.save();
      return;
    } catch (err) {
      console.log(err);
    }
  }
}
