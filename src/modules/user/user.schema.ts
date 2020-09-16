import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, length: 25 })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true, unique: true, length: 13 })
  id: number;
  @Prop({ required: true })
  password: string;
  @Prop()
  img: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
