import { Body, Controller, Post } from '@nestjs/common';
import { UserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: UserDto) {
    return this.usersService.createUser(request);
  }
}
