import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
   * Enable CORS (Cross-Origin Resource Sharing)
   * This is necessary because our frontend (e.g. Vite/React at localhost:5173)
   * is running on a different port than our backend. CORS allows the browser
   * to securely perform API requests to this server.
   */
  app.enableCors({
    origin: 'http://localhost:5173',
  });

  /*
   * Enable Global Validation Pipe
   * This automatically validates incoming requests (like POST bodies) against our DTO classes.
   * - whitelist: automatically strips properties that do not have any decorators in the DTO.
   * - forbidNonWhitelisted: throws an error instead of stripping non-whitelisted properties.
   * - transform: automatically transforms payloads to be objects typed according to their DTO classes.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  /*
   * Start the server
   * Reads the PORT environment variable, or defaults to 3000 if not set.
   * This is useful for deployment environments where the port is dynamically assigned.
   */
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
