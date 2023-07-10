import { Injectable, NotFoundException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async find(email: string) {
    const wildCardEmail = `${email}%`
    const res = await this.repo.query('SELECT * FROM user WHERE email LIKE ?', [
      wildCardEmail,
    ])
    if (!res.length) {
      throw new NotFoundException('Any user Found!')
    }
    return res
  }

  async findOne(id: number) {
    const user = await this.repo.findOneBy({ id })
    if (!user) {
      throw new NotFoundException('Any user Found!')
    }
    return user
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id)
    if (!user) {
      throw new NotFoundException('Any user Found!')
    }
    Object.assign(user, attrs)
    return this.repo.save(user)
  }

  async delete(id: number) {
    const user = await this.findOne(id)
    if (!user) {
      throw new NotFoundException('Any user Found!')
    }
    return this.repo.remove(user)
  }

  getAllUsers() {
    return this.repo.find()
  }
}
