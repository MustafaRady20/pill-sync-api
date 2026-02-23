import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { DiseaseService } from './diseases.service';

@ApiTags('Diseases')
@Controller('diseases')
export class DiseaseController {
  constructor(private readonly diseaseService: DiseaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create new disease' })
  @ApiResponse({ status: 201, description: 'Disease created successfully' })
  create(@Body() dto: CreateDiseaseDto) {
    return this.diseaseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated diseases list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.diseaseService.findAll(+page, +limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get disease by ID' })
  findOne(@Param('id') id: string) {
    return this.diseaseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update disease' })
  update(@Param('id') id: string, @Body() dto: UpdateDiseaseDto) {
    return this.diseaseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete disease' })
  remove(@Param('id') id: string) {
    return this.diseaseService.remove(id);
  }
}