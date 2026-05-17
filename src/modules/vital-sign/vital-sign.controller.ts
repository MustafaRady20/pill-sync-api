import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { VitalSignsService } from './vital-sign.service';

@ApiTags('Vital Signs & Lab Tests')
@Controller('vital-signs')
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new vital sign or lab test' })
  @ApiBody({ type: CreateVitalSignDto })
  @ApiResponse({
    status: 201,
    description: 'Vital sign recorded successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  create(@Body() dto: CreateVitalSignDto) {
    return this.vitalSignsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vital signs' })
  @ApiResponse({ status: 200, description: 'List of all vital signs.' })
  findAll() {
    return this.vitalSignsService.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all vital signs for a patient' })
  @ApiParam({
    name: 'patientId',
    description: 'MongoDB ObjectId of the patient',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by vital sign type (e.g. blood_pressure)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of vital signs for the patient.',
  })
  findByPatient(
    @Param('patientId') patientId: string,
    @Query('type') type?: string,
  ) {
    if (type)
      return this.vitalSignsService.findByPatientAndType(patientId, type);
    return this.vitalSignsService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vital sign by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the record' })
  @ApiResponse({ status: 200, description: 'Vital sign found.' })
  @ApiResponse({ status: 404, description: 'Vital sign not found.' })
  findOne(@Param('id') id: string) {
    return this.vitalSignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vital sign by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the record' })
  @ApiBody({ type: CreateVitalSignDto })
  @ApiResponse({ status: 200, description: 'Vital sign updated successfully.' })
  @ApiResponse({ status: 404, description: 'Vital sign not found.' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateVitalSignDto>) {
    return this.vitalSignsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vital sign by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the record' })
  @ApiResponse({ status: 204, description: 'Vital sign deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Vital sign not found.' })
  remove(@Param('id') id: string) {
    return this.vitalSignsService.remove(id);
  }
}
