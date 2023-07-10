import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import * as crypto from 'crypto'

import { User } from './user.entity'
import { CreateUserDto } from './dtos/create-user.dto'

function hashPassword(password: string) {
  const salt = crypto.randomBytes(32).toString('hex')
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex')

  return {
    salt,
    hash: genHash,
  }
}

function validationPassword(
  password: string,
  salt: string,
  hashedPassword: string,
): boolean {
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex')

  return genHash === hashedPassword
}

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async signup(email: string, password: string) {
    const existUser = await this.repo.findOne({ where: { email } })
    if (existUser) {
      throw new ConflictException('Email already in use!')
    }
    const { salt, hash } = hashPassword(password)
    const user = this.repo.create({ email, hashedPassword: hash, salt })

    return this.repo.save(user)
  }

  async signin(email: string, password: string) {
    const userArray: User[] = await this.repo.query(
      'SELECT * FROM user WHERE email = ?;',
      [email],
    )
    if (!userArray.length) {
      throw new BadRequestException('email does not exist')
    }
    const { salt, hashedPassword } = userArray[0]
    const isValidPassword = validationPassword(password, salt, hashedPassword)
    if (!isValidPassword) {
      throw new UnauthorizedException('wrong password')
    }
    return userArray
  }
}
