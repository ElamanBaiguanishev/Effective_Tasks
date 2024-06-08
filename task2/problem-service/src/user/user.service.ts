import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  async fixProblemsByUserId(userIds: number[]): Promise<number> {
    const usersWithProblems = await this.userRepository.find({
      where: {
        id: In(userIds),
        problem: true,
      },
    });
    if (usersWithProblems.length > 0) {
      await this.userRepository.update({ id: In(userIds), problem: true }, { problem: false });
    }
    return usersWithProblems.length;
  }

  async fixProblems(): Promise<number> {
    const usersWithProblems = await this.userRepository.find({ where: { problem: true } });
    await this.userRepository.update({ problem: true }, { problem: false });
    return usersWithProblems.length;
  }
}
