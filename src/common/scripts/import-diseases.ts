import * as xlsx from 'xlsx';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DiseaseService } from '../../modules/diseases/diseases.service';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(DiseaseService);
  const filePath = path.join(__dirname, 'Dimension.xlsx');

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (fs.lstatSync(filePath).isDirectory()) {
    throw new Error(`Expected file but got directory: ${filePath}`);
  }
  const workbook = xlsx.readFile(filePath); const sheet = workbook.Sheets['Dim4'];
  const rows = xlsx.utils.sheet_to_json<any>(sheet);

  let currentFamily: any = null;
let currentCategory: any = null;
let currentParent: any = null;

for (const row of rows) {
  const code = row['Disease code']?.toString().trim();
  const name = row['Disease name']?.toString().trim();

  if (!code || !name) continue;

  const similarNames: string[] = [];

  for (let i = 1; i <= 10; i++) {
    const key = `Similar${i}`;

    if (row[key]) {
      similarNames.push(row[key].toString().trim());
    }
  }

  let level = 1;
  let family = '';
  let familyCode = '';
  let parentCode = '';

  // LEVEL 1 => FAMILY
  if (code.length === 2) {
    level = 1;

    currentFamily = {
      code,
      name,
    };

    family = name;
    familyCode = code;
  }

  // LEVEL 2 => CATEGORY
  else if (code.length === 3) {
    level = 2;

    currentCategory = {
      code,
      name,
    };

    family = currentFamily?.name;
    familyCode = currentFamily?.code;
    parentCode = currentFamily?.code;
  }

  // LEVEL 3 => PARENT
  else if (code.length === 5) {
    level = 3;

    currentParent = {
      code,
      name,
    };

    family = currentFamily?.name;
    familyCode = currentFamily?.code;
    parentCode = currentCategory?.code;
  }

  // LEVEL 4 => CHILD
  else {
    level = 4;

    family = currentFamily?.name;
    familyCode = currentFamily?.code;
    parentCode = currentParent?.code;
  }

  const doc = {
    diseaseCode: code,
    name,
    similarNames: [...new Set(similarNames)],
    family,
    familyCode,
    parentCode,
    level,
  };

  await service.upsert(doc);

  console.log(`Imported: ${code} - ${name}`);
}
}


bootstrap();