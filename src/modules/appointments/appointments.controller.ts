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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Appointments')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'List of all appointments.' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all appointments for a specific patient' })
  @ApiParam({
    name: 'patientId',
    description: 'MongoDB ObjectId of the patient',
  })
  @ApiResponse({
    status: 200,
    description: 'List of appointments for the patient.',
  })
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the appointment' })
  @ApiResponse({ status: 200, description: 'Appointment found.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAppointmentDto>) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an appointment by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the appointment' })
  @ApiResponse({
    status: 204,
    description: 'Appointment deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
