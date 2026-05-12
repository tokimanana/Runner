import { Test, TestingModule } from '@nestjs/testing';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';

describe('MealPlansController', () => {
  let controller: MealPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlansController],
      providers: [MealPlansService],
    }).compile();

    controller = module.get<MealPlansController>(MealPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
