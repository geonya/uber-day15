import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOneOrFail: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(() => 'token-is-here'),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: MockRepository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'sdiodsif@naver.com',
      password: '234234sd',
      role: UserRole.Host,
    };
    it('should fail on user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'dskja@nsdak.com',
      });
      const result = await usersService.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: `There is a user with that email already`,
      });
    });
    it('should create user', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      const result = await usersService.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(result).toEqual({
        ok: true,
        error: null,
      });
    });
    it('should fail on except', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.createAccount(createAccountArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: false,
        error: 'Could not create account',
      });
    });
    describe('login', () => {
      const loginArgs = {
        email: 'login@login.login',
        password: '1234',
      };
      it('should fail on user not found', async () => {
        usersRepository.findOne.mockResolvedValue(null);
        const result = await usersService.login(loginArgs);
        expect(result).toEqual({ ok: false, error: 'User not found' });
      });
      it('should fail if password is wrong', async () => {
        const mockedUser = {
          id: 1,
          checkPassword: jest.fn(() => Promise.resolve(false)),
        };
        usersRepository.findOne.mockResolvedValue(mockedUser);
        const result = await usersService.login(loginArgs);
        expect(result).toEqual({
          ok: false,
          error: 'Wrong password',
        });
      });
      it('should login with token', async () => {
        const mockedUser = {
          id: 1,
          checkPassword: jest.fn(() => Promise.resolve(true)),
        };
        usersRepository.findOne.mockResolvedValue(mockedUser);
        const result = await usersService.login(loginArgs);
        expect(jwtService.sign).toHaveBeenCalledTimes(1);
        expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
        expect(result).toEqual({
          ok: true,
          token: expect.any(String),
        });
      });
      it('should fail on exception', async () => {
        usersRepository.findOne.mockRejectedValue(new Error());
        const result = await usersService.login(loginArgs);
        expect(result).toEqual({
          ok: false,
          error: 'Login is fail.',
        });
      });
    });
  });
  describe('findById', () => {
    it('should fail on user not found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await usersService.findById(1);
      expect(usersRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOneOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'User Not Found',
      });
    });
    it('should find user', async () => {
      const mockedUser = {
        id: 1,
        email: 'email@email.email',
      };
      usersRepository.findOneOrFail.mockResolvedValue(mockedUser);
      const result = await usersService.findById(1);
      expect(result).toEqual({
        ok: true,
        user: mockedUser,
      });
    });
  });
  describe('editProfile', () => {
    const editProfileInputs = { email: 'email@email.email', password: '1234' };
    it('should fail on user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await usersService.editProfile(1, editProfileInputs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        ok: false,
        error: 'user not found',
      });
    });
    it('should change email success', async () => {
      const oldUser = {
        email: 'old@old.old',
      };
      const newUser = {
        email: editProfileInputs.email,
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      const result = await usersService.editProfile(1, {
        email: editProfileInputs.email,
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true });
    });
    it('should change password success', async () => {
      const oldUser = {
        password: 'abcde',
      };
      const newUser = {
        password: editProfileInputs.password,
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      const result = await usersService.editProfile(1, {
        password: editProfileInputs.password,
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.editProfile(1, editProfileInputs);
      expect(result).toEqual({
        ok: false,
        error: 'Could not update profile',
      });
    });
  });
});
