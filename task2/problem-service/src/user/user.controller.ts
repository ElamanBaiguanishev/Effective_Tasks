import { Controller, Body, Patch } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch('fix-problems-byId')
  async fixProblemsById(@Body('userIds') users: number[]): Promise<{ fixed: number }> {
    const fixed = await this.userService.fixProblemsByUserId(users);
    return { fixed };
  }

  @Patch('fix-problems')
  async fixProblems(): Promise<{ fixed: number }> {
    const fixed = await this.userService.fixProblems();
    return { fixed };
  }
}
