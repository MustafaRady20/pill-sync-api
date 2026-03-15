import { Test, TestingModule } from '@nestjs/testing';
import { DrugController } from './drug.controller';
import { DrugService } from './drug.service';

describe('DrugController', () => {
  let controller: DrugController;
  let service: DrugService;

  const mockDrug = {
    _id: '507f1f77bcf86cd799439011',
    tradeName: 'Augmentin',
    genericName: 'Amoxicillin',
  };

  const mockDrugService = {
    create: jest.fn().mockResolvedValue(mockDrug),
    findAll: jest.fn().mockResolvedValue([mockDrug]),
    findOne: jest.fn().mockResolvedValue(mockDrug),
    update: jest.fn().mockResolvedValue(mockDrug),
    remove: jest.fn().mockResolvedValue(undefined),
    findByTradeName: jest.fn().mockResolvedValue([mockDrug]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrugController],
      providers: [
        {
          provide: DrugService,
          useValue: mockDrugService,
        },
      ],
    }).compile();

    controller = module.get<DrugController>(DrugController);
    service = module.get<DrugService>(DrugService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a drug', async () => {
    const result = await controller.create(mockDrug as any);
    expect(result.tradeName).toBe('Augmentin');
    expect(service.create).toHaveBeenCalled();
  });

  it('should return all drugs', async () => {
    const result = await controller.findAll();
    expect(result.length).toBe(1);
  });

  it('should search drugs by name', async () => {
    const result = await controller.search('Augmentin');
    expect(result[0].tradeName).toBe('Augmentin');
  });

  it('should return one drug', async () => {
    const result = await controller.findOne(mockDrug._id);
    expect(result).toBeDefined();
  });

  it('should update a drug', async () => {
    const result = await controller.update(mockDrug._id, {
      tradeName: 'Updated',
    });
    expect(result).toBeDefined();
  });

  it('should delete a drug', async () => {
    await expect(controller.remove(mockDrug._id)).resolves.not.toThrow();
  });
});
