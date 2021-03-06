import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, length: 25 })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true, unique: true, length: 11 })
  id: number;
  @Prop({ required: true })
  password: string;
  @Prop()
  img: string;
  @Prop({default: 0})
  loginTries: number
  @Prop({default: false})
  isBlocked: boolean;
  @Prop({default: true})
  status: boolean
}
export const UserSchema = SchemaFactory.createForClass(User);
