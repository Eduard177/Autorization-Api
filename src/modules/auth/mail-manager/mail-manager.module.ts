import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/schemas/user.schema';
import { MailManagerController } from './mail-manager.controller';
import { MailManagerService } from './mail-manager.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers:[MailManagerController],
  providers: [MailManagerService]
})
export class MailManagerModule {}
