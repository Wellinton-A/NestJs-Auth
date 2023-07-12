import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'

import { AuthService } from './auth.service'
import { User } from './user.entity'
import { Repository } from 'typeorm'

describe('Auth service test', () => {
  let service: AuthService
  let userRepository: Repository<User>

  const USER_REPOSITORY_TOKEN = getRepositoryToken(User)

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findOne: jest.fn(() => Promise.resolve()),
            create: jest.fn((email: string, password: string) =>
              Promise.resolve({ id: 1, email, password }),
            ),
            query: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(AuthService)
    userRepository = module.get(USER_REPOSITORY_TOKEN)
  })

  test('service should be defined', () => {
    expect(service).toBeDefined()
  })

  test('userRepository should be defined', () => {
    expect(userRepository).toBeDefined()
  })

  test('should create a new user with hashed password', async () => {
    const password = '123456789'
    const user = await service.signup('example@email.com', password)
    console.log(user)
    expect(user.hashedPassword === password).toBeFalsy
  })
})
