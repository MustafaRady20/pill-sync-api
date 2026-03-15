import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { SafetyOverrideDto } from './dto/safety-override.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import {  UserRole } from 'src/modules/users/schemas/user.schema';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { UserDocument } from 'src/modules/users/schemas/user.schema';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  // ─── Doctor endpoints ────────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: '[Doctor] Create a draft prescription' })
  create(
    @CurrentUser() doctor: UserDocument,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(doctor._id.toString(), dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Doctor] Run safety check and activate prescription',
    description:
      'Returns 400 with safetyCheckResult if any warnings are found. ' +
      'Doctor must then call /override to force-activate with a reason.',
  })
  activate(@CurrentUser() doctor: UserDocument, @Param('id') id: string) {
    return this.prescriptionsService.activate(doctor._id.toString(), id);
  }

  @Patch(':id/override')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Doctor] Override safety warnings and force-activate',
    description: 'Must provide a clinical reason. Recorded for audit trail.',
  })
  override(
    @CurrentUser() doctor: UserDocument,
    @Param('id') id: string,
    @Body() dto: SafetyOverrideDto,
  ) {
    return this.prescriptionsService.overrideAndActivate(
      doctor._id.toString(),
      id,
      dto,
    );
  }

  @Patch(':id/cancel')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: '[Doctor] Cancel a prescription' })
  cancel(@CurrentUser() doctor: UserDocument, @Param('id') id: string) {
    return this.prescriptionsService.cancel(doctor._id.toString(), id);
  }

  @Get('my-prescriptions')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Doctor] List all prescriptions written by this doctor',
  })
  getDoctorPrescriptions(@CurrentUser() doctor: UserDocument) {
    return this.prescriptionsService.getDoctorPrescriptions(
      doctor._id.toString(),
    );
  }

  // ─── Patient endpoints ───────────────────────────────────────────────────

  @Get('my')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: '[Patient] View my prescriptions' })
  getMyPrescriptions(@CurrentUser() patient: UserDocument) {
    return this.prescriptionsService.getPatientPrescriptions(
      patient._id.toString(),
    );
  }

  // ─── Shared ──────────────────────────────────────────────────────────────

  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get a single prescription by ID' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
}
