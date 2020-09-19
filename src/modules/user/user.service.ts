import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    } catch (error) {
      if (error.keyPattern.id) {
        if ((error.keyPattern.id = 1)) {
          throw new HttpException(
            'there is already a user with that id',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (error.keyPattern.email) {
        if ((error.keyPattern.email = 1)) {
          throw new HttpException(
            'there is already a user with that email',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw new HttpException(
        'Somthing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
