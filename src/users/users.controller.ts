import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { CreateUserDto } from './dtos/create-user.dto'
import { UsersService } from './users.service'
import { serialize } from '../interceptors/serialize.interceptor'
import { UserDto } from './dtos/user.dto'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { AuthGuard } from '../guard/auth.guard'
import { User } from './user.entity'

@serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('who')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user
  }

  @Post('signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const [user] = await this.authService.signin(body.email, body.password)
    session.userId = user.id
  }

  @Post('/signup')
  signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body.email, body.password)
  }

  @Post('signout')
  signout(@Session() session: any) {
    session.userId = null
  }

  @Get('/users/email')
  async findUserByEmail(@Query('email') email: string) {
    const user = await this.usersService.find(email)
    return user
  }

  @Get('/users/:id')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOne(Number(id))
  }

  @Patch('/users/:id')
  updateById(@Body() body: Partial<CreateUserDto>, @Param('id') id: string) {
    return this.usersService.update(Number(id), body)
  }

  @Delete('/users/:id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id))
  }
}
