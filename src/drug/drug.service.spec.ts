import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DrugService } from './drug.service';
import { Drug } from './schemas/drug.schema';
import { Model } from 'mongoose';

describe('DrugService', () => {
  let service: DrugService;
  let model: Model<Drug>;

  const mockDrug = {
    _id: '507f1f77bcf86cd799439011',
    senomeCode: 'DRG-001',
    tradeName: 'Augmentin',
    genericName: 'Amoxicillin',
    dose: '625mg',
    strength: '625mg',
    form: 'tablet',
    route: 'oral',
    similarTradeNames: ['Amoclan'],
  };

  const mockDrugModel = {
    create: jest.fn().mockResolvedValue(mockDrug),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockDrug]),
    }),
    findById: jest.fn().mockResolvedValue(mockDrug),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockDrug),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockDrug),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrugService,
        {
          provide: getModelToken(Drug.name),
          useValue: mockDrugModel,
        },
      ],
    }).compile();

    service = module.get<DrugService>(DrugService);
    model = module.get<Model<Drug>>(getModelToken(Drug.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a drug', async () => {
    const result = await service.create(mockDrug as any);
    expect(result.tradeName).toBe('Augmentin');
    expect(model.create).toHaveBeenCalled();
  });

  it('should return all drugs', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].tradeName).toBe('Augmentin');
  });

  it('should find one drug by id', async () => {
    const result = await service.findOne(mockDrug._id);
    expect(result.tradeName).toBe('Augmentin');
  });

  it('should update a drug', async () => {
    const result = await service.update(mockDrug._id, {
      tradeName: 'NewName',
    });
    expect(result).toBeDefined();
  });

  it('should delete a drug', async () => {
    await expect(service.remove(mockDrug._id)).resolves.not.toThrow();
  });
});
