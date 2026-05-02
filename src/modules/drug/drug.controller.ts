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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DrugService } from './drug.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Drugs')
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth("accessToken")
@Controller('drugs')
export class DrugController {
  constructor(private readonly drugService: DrugService) {}

  @Post()
  create(@Body() dto: CreateDrugDto) {
    return this.drugService.create(dto);
  }

  @Get()
  findAll() {
    return this.drugService.findAll();
  }

  @Get('search')
  search(@Query('name') name: string) {
    return this.drugService.findByTradeName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drugService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDrugDto) {
    return this.drugService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drugService.remove(id);
  }
}
