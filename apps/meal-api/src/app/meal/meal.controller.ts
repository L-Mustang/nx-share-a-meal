import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { MealService } from './meal.service'
import { CreateMealDto, UpdateMealDto } from './meal.dto'
import { Meal, ParticipationInfo } from '@cswp/api-interfaces'
import { Public } from '../common/decorators/decorators'
import { AuthApiGuard } from '@cswp/api-interfaces'

@ApiTags('Meal')
@Controller('meal')
@UseGuards(AuthApiGuard)
export class MealController {
  private readonly logger = new Logger(MealController.name)

  constructor(private readonly mealService: MealService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register meal',
    description:
      'Add a new meal. Notice that allergenes can only contain "gluten", "noten" and/or "lactose".'
  })
  @ApiBody({ type: CreateMealDto, description: 'The new meal' })
  @ApiResponse({ status: 201, description: 'OK.', type: [Meal] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @Body() createMealDto: CreateMealDto,
    @Req() req
  ): Promise<Meal> {
    this.logger.log('create ' + createMealDto.name)
    this.logger.log('create ' + JSON.stringify(req.user))
    return this.mealService.create({ ...createMealDto, cook: req.user.userId })
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiResponse({
    status: 201,
    description: 'All records',
    type: [Meal]
  })
  @ApiResponse({ status: 403, description: 'Forbidden.', type: Error })
  findAll(/* @Query() queryParams?: QueryMealsDto */): Promise<Meal[]> {
    this.logger.log('findAll')
    // this.logger.log('queryParams: ', queryParams);
    return this.mealService.findAll(/* queryParams */)
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single meal by id' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: Meal
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, no access',
    type: Error
  })
  findOne(@Param('id') id: number): Promise<Meal> {
    this.logger.log('findOne id=' + id)
    return this.mealService.findOne(id)
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a single meal' })
  @ApiBody({
    type: CreateMealDto,
    description:
      'The updated properties. You can update a whole Meal object, or only a smaller subset of the properties.'
  })
  @ApiResponse({ status: 201, description: 'OK.', type: [Meal] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(
    @Param('id') id: number,
    @Body() updateMealDto: UpdateMealDto,
    @Req() req
  ): Promise<Meal> {
    this.logger.log('update mealId=' + id)
    return this.mealService.update(id, updateMealDto, req.user.userId)
  }

  @Get(':id/participate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Participate in a meal.',
    description:
      'Register or unregister as participant in a meal. Requires a valid JWT. The same endpoint is used for both registering and unregistering. The second request unregisters the previous from the same user.'
  })
  @ApiResponse({ status: 201, description: 'OK.', type: [ParticipationInfo] })
  @ApiResponse({ status: 401, description: 'Not Authorized' })
  @ApiResponse({
    status: 404,
    description: 'Not Found, in case the meal does not exist.'
  })
  async participate(
    @Param('id') id: number,
    @Req() req
  ): Promise<ParticipationInfo> {
    this.logger.log(
      'participate meal id=' + id + ' participant=' + req.user.userId
    )
    return this.mealService.participate(id, req.user.userId)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete meal' })
  @ApiBody({ type: 'string', description: 'the id of the meal to remove' })
  @ApiResponse({ status: 201, description: 'OK.', type: [Meal] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async delete(@Param('id') id: number, @Req() req): Promise<void> {
    this.logger.log(`remove mealId=${id} userId=${req.user.userId}`)
    return this.mealService.remove(id, req.user.userId)
  }
}