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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { PatientAllergyService } from './patient-allergy.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import  { UserRole } from 'src/modules/users/schemas/user.schema';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { UserDocument } from 'src/modules/users/schemas/user.schema';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@ApiTags('Allergies — Patient (self)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@Controller('allergies/my')
export class MyAllergyController {
  constructor(private readonly allergyService: PatientAllergyService) {}

  @Get()
  @ApiOperation({ summary: '[Patient] List my allergies' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Pass true to include deactivated records',
  })
  getMyAllergies(
    @CurrentUser() user: UserDocument,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.allergyService.findAllForPatient(
      user._id.toString(),
      includeInactive === 'true',
    );
  }

  @Get(':allergyId')
  @ApiOperation({ summary: '[Patient] Get a single allergy record' })
  getOne(
    @CurrentUser() user: UserDocument,
    @Param('allergyId') allergyId: string,
  ) {
    return this.allergyService.findOne(user._id.toString(), allergyId);
  }

  @Post()
  @ApiOperation({
    summary: '[Patient] Self-report a new allergy',
    description:
      'Sets confirmedByDoctor = false. ' +
      'If a deactivated record with the same name exists it will be re-activated. ' +
      'If an active record already exists a 409 is returned.',
  })
  selfReport(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateAllergyDto,
  ) {
    return this.allergyService.create(user._id.toString(), dto, false);
  }
}


@ApiTags('Allergies — Doctor (patient management)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('patients/:patientId/allergies')
export class DoctorAllergyController {
  constructor(private readonly allergyService: PatientAllergyService) {}

  @Get()
  @ApiOperation({ summary: '[Doctor] List a patient\'s allergies' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Pass true to include deactivated records for full history',
  })
  getPatientAllergies(
    @Param('patientId') patientId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.allergyService.findAllForPatient(
      patientId,
      includeInactive === 'true',
    );
  }

  @Get(':allergyId')
  @ApiOperation({ summary: '[Doctor] Get a single allergy record' })
  getOne(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
  ) {
    return this.allergyService.findOne(patientId, allergyId);
  }

  @Post()
  @ApiOperation({
    summary: '[Doctor] Add or confirm an allergy for a patient',
    description:
      'Sets confirmedByDoctor = true automatically. ' +
      'If a deactivated record with the same name exists it will be re-activated.',
  })
  addAllergy(
    @Param('patientId') patientId: string,
    @Body() dto: CreateAllergyDto,
  ) {
    return this.allergyService.create(patientId, dto, true);
  }

  @Patch(':allergyId')
  @ApiOperation({
    summary: '[Doctor] Update allergy severity, reaction, type, or name',
    description:
      'Sets confirmedByDoctor = true automatically. ' +
      'Changing the name triggers a new drug resolution attempt and guards against name collision.',
  })
  update(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
    @Body() dto: UpdateAllergyDto,
  ) {
    return this.allergyService.update(patientId, allergyId, dto, true);
  }

  @Delete(':allergyId')
  @ApiOperation({
    summary: '[Doctor] Soft-delete (deactivate) an allergy record',
    description:
      'Sets isActive = false. Record is NEVER hard-deleted — ' +
      'history is preserved for audit and retrospective safety analysis. ' +
      'Re-activate by calling POST with the same name.',
  })
  deactivate(
    @Param('patientId') patientId: string,
    @Param('allergyId') allergyId: string,
  ) {
    return this.allergyService.deactivate(patientId, allergyId);
  }
}