import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');

        // Production (Railway): uses a single REDIS_URL connection string
        // Local development (Docker): uses separate REDIS_HOST and REDIS_PORT
        if (redisUrl) {
          return {
            connection: {
              url: redisUrl,
            },
          };
        }

        // Fallback for local Docker development
        return {
          connection: {
            host: config.get<string>('REDIS_HOST'),
            port: Number(config.get<string>('REDIS_PORT')),
          },
        };
      },
    }),

    DatabaseModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
