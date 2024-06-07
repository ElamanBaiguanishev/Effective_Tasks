import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService
  ) { }

  async getHistory(userId: number, page: number = 1, limit: number = 10): Promise<History[]> {
    try {
      const response = await lastValueFrom(this.httpService.get('http://localhost:3001/history', {
        params: {
          userId,
          page,
          limit,
        },
      }));
      const history: History[] = response.data

      return history
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.save(createUserDto);

    try {
      await lastValueFrom(this.httpService.post('http://localhost:3001/history', { user_id: user.id, action: 'create' }));
    } catch (error) {
      throw new BadRequestException(error)
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    });

    if (!user) throw new NotFoundException("User not found");

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    user.firstName = updateUserDto.firstName
    user.lastName = updateUserDto.lastName
    user.age = updateUserDto.age
    user.gender = updateUserDto.gender

    await this.userRepository.save(user);

    try {
      await lastValueFrom(this.httpService.post('http://localhost:3001/history', { user_id: user.id, action: 'update' }));
    } catch (error) {
      throw new BadRequestException(error)
    }

    return user;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      await this.userRepository.remove(user);
    }
    return user;
  }
}
