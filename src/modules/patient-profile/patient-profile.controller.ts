import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PatientProfileService } from './patient-profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/schemas/user.schema';
import { CreateAllergyDto } from 'src/modules/patient-allergy/dto/create-allergy.dto';

@ApiTags('Patient Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients/:patientId')
export class PatientProfileController {
  constructor(private patientProfileService: PatientProfileService) {}

  @Get('profile')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: '[Doctor] Full patient medical profile' })
  getProfile(@Param('patientId') patientId: string) {
    return this.patientProfileService.getFullProfile(patientId);
  }

  @Get('allergies')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: '[Doctor] List active patient allergies' })
  getAllergies(@Param('patientId') patientId: string) {
    return this.patientProfileService.getPatientAllergies(patientId);
  }

  @Post('allergies')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: '[Doctor] Add or confirm a patient allergy' })
  addAllergy(@Param('patientId') patientId: string, @Body() dto: CreateAllergyDto) {
    return this.patientProfileService.addAllergy(patientId, dto);
  }

  @Delete('allergies/:allergyId')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: '[Doctor] Deactivate (remove) an allergy record' })
  deactivateAllergy(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
  ) {
    return this.patientProfileService.deactivateAllergy(patientId, allergyId);
  }
}