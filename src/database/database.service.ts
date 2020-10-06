import {ConfigService} from '../config/config.service';
import {Configuration} from '../config/config.keys';
import { MongooseModule } from '@nestjs/mongoose';
import {ConfigModule} from '../config/config.module'

export const databaseProviders = [
    MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) =>({
            uri: configService.get(Configuration.MONGO_URI),
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex:true,
            useFindAndModify: true
        }),
        
    })
]