import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CONFIG_OPTIONS } from 'src/jwt/jwt.constants';
import { JwtService } from 'src/jwt/jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: 'testKey' },
        },
      ],
    }).compile();
    jwtService = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });
  it.todo('sign');
  it.todo('verify');
});
