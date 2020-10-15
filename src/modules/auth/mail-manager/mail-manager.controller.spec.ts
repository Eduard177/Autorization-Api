import { Test, TestingModule } from '@nestjs/testing';
import { MailManagerController } from './mail-manager.controller';

describe('MailManagerController', () => {
  let controller: MailManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailManagerController],
    }).compile();

    controller = module.get<MailManagerController>(MailManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
