import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dtos/create-complaint.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Complaints')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({ status: 201, description: 'Complaint created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  @ApiResponse({ status: 200, description: 'List of all complaints.' })
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all complaints for a specific patient' })
  @ApiParam({
    name: 'patientId',
    description: 'MongoDB ObjectId of the patient',
  })
  @ApiResponse({
    status: 200,
    description: 'List of complaints for the patient.',
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.complaintsService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a complaint by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the complaint' })
  @ApiResponse({ status: 200, description: 'Complaint found.' })
  @ApiResponse({ status: 404, description: 'Complaint not found.' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a complaint by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the complaint' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({ status: 200, description: 'Complaint updated successfully.' })
  @ApiResponse({ status: 404, description: 'Complaint not found.' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateComplaintDto>) {
    return this.complaintsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a complaint by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the complaint' })
  @ApiResponse({ status: 204, description: 'Complaint deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Complaint not found.' })
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }
}
