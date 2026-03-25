import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './common/env';

async function bootstrap() {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
