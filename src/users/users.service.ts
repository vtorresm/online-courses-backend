import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(email: string, password: string, role: string = 'student') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersRepository.createUser({
      email,
      password: hashedPassword,
      role,
    });
  }

  async findUserByEmail(email: string) {
    return this.usersRepository.findUserByEmail(email);
  }
}
