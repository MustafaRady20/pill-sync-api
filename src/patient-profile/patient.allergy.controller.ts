import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatientAllergyService } from './patient-allergy.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type {UserDocument} from 'src/users/schemas/user.schema'
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
// ─────────────────────────────────────────────────────────────────────────────
// Patient route — /allergies/my/...
// Patient can only access their OWN allergy records
// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('My Allergies (Patient)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@Controller('allergies/my')
export class MyAllergyController {
  constructor(private allergyService: PatientAllergyService) {}

  @Get()
  @ApiOperation({ summary: '[Patient] List my active allergies' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getMyAllergies(
    @CurrentUser() user: UserDocument,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.allergyService.findAllForPatient(
      user._id.toString(),
      includeInactive === 'true',
    );
  }

  @Post()
  @ApiOperation({
    summary: '[Patient] Self-report an allergy',
    description:
      'Patient-submitted. confirmedByDoctor will be false. Doctor can confirm later.',
  })
  selfReport(@CurrentUser() user: UserDocument, @Body() dto: CreateAllergyDto) {
    return this.allergyService.create(user._id.toString(), dto, false);
  }

  @Get(':allergyId')
  @ApiOperation({ summary: '[Patient] Get a single allergy record' })
  getOne(@CurrentUser() user: UserDocument, @Param('allergyId') allergyId: string) {
    return this.allergyService.findOne(user._id.toString(), allergyId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor route — /patients/:patientId/allergies
// Doctor can read, add, update, and deactivate allergies for any patient
// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('Patient Allergies (Doctor)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('patients/:patientId/allergies')
export class DoctorAllergyController {
  constructor(private allergyService: PatientAllergyService) {}

  @Get()
  @ApiOperation({ summary: '[Doctor] List allergies for a patient' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getPatientAllergies(
    @Param('patientId') patientId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.allergyService.findAllForPatient(patientId, includeInactive === 'true');
  }

  @Post()
  @ApiOperation({
    summary: '[Doctor] Add a confirmed allergy for a patient',
    description: 'Sets confirmedByDoctor = true automatically.',
  })
  addAllergy(@Param('patientId') patientId: string, @Body() dto: CreateAllergyDto) {
    return this.allergyService.create(patientId, dto, true);
  }

  @Get(':allergyId')
  @ApiOperation({ summary: '[Doctor] Get a single allergy record' })
  getOne(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
  ) {
    return this.allergyService.findOne(patientId, allergyId);
  }

  @Patch(':allergyId')
  @ApiOperation({
    summary: '[Doctor] Update allergy severity, reaction, or type',
    description: 'Any doctor update also sets confirmedByDoctor = true.',
  })
  update(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
    @Body() dto: UpdateAllergyDto,
  ) {
    return this.allergyService.update(patientId, allergyId, dto);
  }

  @Delete(':allergyId')
  @ApiOperation({
    summary: '[Doctor] Soft-delete (deactivate) an allergy',
    description:
      'Sets isActive = false. Record is preserved for audit trail. ' +
      'Can be re-activated by creating the same allergy name again.',
  })
  deactivate(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
  ) {
    return this.allergyService.deactivate(patientId, allergyId);
  }
}