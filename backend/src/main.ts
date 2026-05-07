import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL].filter(
      Boolean,
    ) as string[],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // REDIS_URL is used in production (Railway provides a single connection string)
  // REDIS_HOST + REDIS_PORT are used in local Docker development
  // We only require one of these two setups to be present
  const hasRedisUrl = !!process.env.REDIS_URL;
  const hasRedisHostPort = !!process.env.REDIS_HOST && !!process.env.REDIS_PORT;

  const requiredEnvVars = ['DATABASE_URL'] as const;
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingEnvVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    );
    process.exit(1);
  }

  if (!hasRedisUrl && !hasRedisHostPort) {
    console.error(
      'Missing Redis configuration. Provide either REDIS_URL (production) ' +
        'or both REDIS_HOST and REDIS_PORT (local development).',
    );
    process.exit(1);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
