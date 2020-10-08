import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Model } from "mongoose";
import { User } from '../../user/user.schema';
import { ExtractJwt, Strategy } from "passport-jwt";
import { Configuration } from "src/config/config.keys";
import { ConfigService } from "src/config/config.service";
import { IJwtPayload } from "../jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private readonly _configService: ConfigService, @InjectModel(User.name) private _userModel: Model<User>){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: _configService.get(Configuration.JWT_SECRET)
        })
    }

    async validate(payload: IJwtPayload){
        const email = payload;
        const user = await this._userModel.findOne({
            where: {email, isBlocked: false}
        })
        if(!user){
            throw new UnauthorizedException()
        }
        return user;
    }
}