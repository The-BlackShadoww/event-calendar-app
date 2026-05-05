import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  // isGlobal: true ensures that this configuration is available throughout the entire
  // application without needing to import ConfigModule in every feature module.
  imports: [
    // ConfigModule is used to load and manage application configuration from environment variables.
    ConfigModule.forRoot({ isGlobal: true }),
    // BullModule.forRootAsync is used to configure the global BullMQ connection.
    /*
     * Global BullMQ Configuration
     *
     * What it does now:
     * This sets up the central connection to our Redis instance. It reads
     * the connection details (host and port) from our environment variables.
     *
     * What it will do later:
     * This acts as the backbone for our queue system. In feature modules
     * (like EventsModule), we will use BullModule.registerQueue() to create
     * specific queues (e.g., 'email-queue', 'event-processing'). Those
     * specific queues will automatically use this central Redis connection
     * to store jobs, which will then be processed asynchronously by Workers.
     */
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
