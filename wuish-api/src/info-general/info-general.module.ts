import { Module } from '@nestjs/common';
import { InfoGeneralController } from './info-general.controller';
import { InfoGeneralService } from './info-general.service';

@Module({
  controllers: [InfoGeneralController],
  providers: [InfoGeneralService],
})
export class InfoGeneralModule {}
