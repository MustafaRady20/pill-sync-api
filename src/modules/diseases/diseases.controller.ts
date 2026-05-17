// disease.controller.ts

import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DiseaseService } from './diseases.service';
import { Disease } from './schema/disease.schema';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Diseases')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('diseases')
export class DiseaseController {
  constructor(private readonly service: DiseaseService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search diseases with ranking' })
  @ApiQuery({
    name: 'q',
    example: 'hypertension',
    description: 'Search query',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of matched diseases',
    type: [Disease],
  })
  search(@Query('q') q?: string) {
    if (q) {
      return this.service.search(q);
    }
    return this.service.findAll();
  }

  @Get(':code/children')
  @ApiOperation({ summary: 'Get children of a disease node' })
  @ApiResponse({
    status: 200,
    description: 'Child diseases/categories',
    type: [Disease],
  })
  getChildren(@Param('code') code: string) {
    return this.service.getChildren(code);
  }

  @Get(':code/parents')
  @ApiOperation({ summary: 'Get parent chain of a disease' })
  @ApiResponse({
    status: 200,
    description: 'Parent hierarchy',
    type: [Disease],
  })
  getParents(@Param('code') code: string) {
    return this.service.getParents(code);
  }
}
