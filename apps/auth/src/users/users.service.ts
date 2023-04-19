import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(request: UserDto) {
    await this.validateCreateUserRequest(request);
    const user = await this.usersRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
    });

    return user;
  }

  async validateCreateUserRequest(createUserDto: UserDto) {
    let user: User;
    try {
      user = await this.usersRepository.findOne({
        email: createUserDto.email,
      });
    } catch (error) {}

    if (user) {
      throw new UnprocessableEntityException('Email already registered');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      email,
    });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async getUser(getUserArgs: Partial<User>) {
    return await this.usersRepository.findOne(getUserArgs);
  }
}
