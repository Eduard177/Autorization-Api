import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { CreateUserDTO } from '../dto/user.dto';
import { compareSync, hashSync } from 'bcrypt';

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
  //login
  async getAuthenticatedUser(email: string, id: number,password: string) {
    const user = await this.getByEmail(email, id);
    await this.verifyPassword( password, user.password);
  }

  //Methos

  async getByEmail(email: string, id: number) {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      if(user.id = id){
        await this.getById(id);
        return user;
      }
    }
    throw new HttpException(
      'User with this email does not exist',
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
}
