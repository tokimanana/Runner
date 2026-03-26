import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app
    .enableCors //{
    //   origin: [
    //     'http://localhost:4200',
    //     'http://localhost:3000',
    //     'https://sandbox.embed.apollographql.com',
    //     'https://pet-market-web-a61t.onrender.com',
    //   ],
    //   credentials: true,
    //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    //   allowedHeaders: ['Content-Type', 'Authorization'],
    // }
    ();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
void bootstrap();
