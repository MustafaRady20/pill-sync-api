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

import { DrugDrugService } from './drug-drug.service';

import {
  CreateDrugDrugInteractionDto,
  UpdateDrugDrugInteractionDto,
} from './dtos/drug-drug-interaction.dto';
import {
  CreateDrugDiseaseInteractionDto,
  UpdateDrugDiseaseInteractionDto,
} from './dtos/drug-disease-interaction.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { UserRole } from 'src/modules/users/schemas/user.schema';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { DrugDiseaseService } from './drug-disease-interaction.service';
import { DrugDiseaseRelation, InteractionSeverity } from './schema/drug-disease-interaction.schema';
import { DrugDrugRelation } from './schema/drug-drug-interaction.schema';


// Drug–Drug Interactions

@ApiTags('Interactions — Drug / Drug')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interactions/drug-drug')
export class DrugDrugController {
  constructor(private readonly drugDrugService: DrugDrugService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Admin/Doctor] Add a drug–drug interaction',
    description:
      'Drug pair order does not matter — stored canonically (smaller ObjectId as drug_a).',
  })
  create(@Body() dto: CreateDrugDrugInteractionDto) {
    return this.drugDrugService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'List all drug–drug interactions' })
  findAll() {
    return this.drugDrugService.findAll();
  }

  @Get('drug/:drugId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'All interactions involving a specific drug (either side of the pair)' })
  findForDrug(@Param('drugId') drugId: string) {
    return this.drugDrugService.findForDrug(drugId);
  }

  @Get('pair')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Check interaction between a specific drug pair' })
  @ApiQuery({ name: 'drugA', required: true, description: 'First drug ObjectId' })
  @ApiQuery({ name: 'drugB', required: true, description: 'Second drug ObjectId' })
  findForPair(
    @Query('drugA') drugA: string,
    @Query('drugB') drugB: string,
  ) {
    return this.drugDrugService.findForPair(drugA, drugB);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get a drug–drug interaction by ID' })
  findById(@Param('id') id: string) {
    return this.drugDrugService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Admin/Doctor] Update interaction metadata',
    description: 'Drug pair is immutable. Only severity, description, mechanism, managementAdvice, source can be updated.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDrugDrugInteractionDto,
  ) {
    return this.drugDrugService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a drug–drug interaction' })
  delete(@Param('id') id: string) {
    return this.drugDrugService.delete(id);
  }
}

// Drug–Disease Interactions

@ApiTags('Interactions — Drug / Disease')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interactions/drug-disease')
export class DrugDiseaseController {
  constructor(private readonly drugDiseaseService: DrugDiseaseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Admin/Doctor] Add a drug–disease interaction',
    description:
      'Unique on (drug, disease, relation) — the same drug can have both ' +
      'an Indication AND a Contraindication for the same disease (e.g. at different doses).',
  })
  create(@Body() dto: CreateDrugDiseaseInteractionDto) {
    return this.drugDiseaseService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'List all drug–disease interactions, optionally filtered' })
  @ApiQuery({ name: 'relation', enum: DrugDiseaseRelation, required: false })
  @ApiQuery({ name: 'severity', enum: InteractionSeverity, required: false })
  findAll(
    @Query('relation') relation?: DrugDiseaseRelation,
    @Query('severity') severity?: InteractionSeverity,
  ) {
    return this.drugDiseaseService.findAll({ relation, severity });
  }

  @Get('drug/:drugId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'All interactions for a drug (indications, contraindications, side effects)' })
  @ApiQuery({ name: 'relation', enum: DrugDrugRelation, required: false })
  findForDrug(
    @Param('drugId') drugId: string,
    @Query('relation') relation?: DrugDiseaseRelation,
  ) {
    return this.drugDiseaseService.findForDrug(drugId, relation);
  }

  @Get('disease/:diseaseId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'All drugs that interact with a disease' })
  @ApiQuery({ name: 'relation', enum: DrugDiseaseRelation, required: false })
  findForDisease(
    @Param('diseaseId') diseaseId: string,
    @Query('relation') relation?: DrugDiseaseRelation,
  ) {
    return this.drugDiseaseService.findForDisease(diseaseId, relation);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get a drug–disease interaction by ID' })
  findById(@Param('id') id: string) {
    return this.drugDiseaseService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: '[Admin/Doctor] Update interaction metadata',
    description: 'Drug and disease refs are immutable. Only clinical metadata can be updated.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDrugDiseaseInteractionDto,
  ) {
    return this.drugDiseaseService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a drug–disease interaction' })
  delete(@Param('id') id: string) {
    return this.drugDiseaseService.delete(id);
  }
}