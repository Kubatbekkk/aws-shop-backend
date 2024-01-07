import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['log', 'error', 'warn'],
  });
  app.use(helmet());
  await app.listen(PORT);
}
bootstrap().then(() => console.log('App is running on %port', PORT));
