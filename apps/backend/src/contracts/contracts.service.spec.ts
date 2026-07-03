import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { ContractRepository } from './repositories/contract.repository';

describe('ContractsService', () => {
  let service: ContractsService;
  let mockRepository: Partial<Record<keyof ContractRepository, jest.Mock>>;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: ContractRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  describe('findOne', () => {
    it('devrait retourner le contrat si le repository le trouve', async () => {
      // Arrange
      const fakeContract = {
        id: 'contract-1',
        name: 'Test Contract',
        tourOperatorId: 'default-tour-operator',
      };
      mockRepository.findOne.mockResolvedValue(fakeContract);

      // Act
      const result = await service.findOne(
        fakeContract.id,
        fakeContract.tourOperatorId,
      );

      // Assert
      expect(result).toEqual(fakeContract);
      expect(mockRepository.findOne).toHaveBeenCalledWith(
        fakeContract.id,
        fakeContract.tourOperatorId,
      );
    });
  });
});
