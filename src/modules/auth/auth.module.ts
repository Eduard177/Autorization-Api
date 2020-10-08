import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from 'src/config/config.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from 'src/config/config.module';
import { Configuration } from 'src/config/config.keys';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({
      session: false,
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService)=>({
        secret: config.get(Configuration.JWT_SECRET),
        signOptions: {
          expiresIn: 3600}   
      }),
    })
    ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtStrategy],
  exports: [ PassportModule, JwtStrategy, ],
})
export class AuthModule {}
