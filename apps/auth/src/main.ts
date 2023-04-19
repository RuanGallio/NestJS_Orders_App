import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rmqService = await app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('AUTH', true));
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
