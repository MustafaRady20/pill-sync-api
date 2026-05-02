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

  for (const row of rows) {
    const similarNames: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const key = `Similar${i}`;
      if (row[key]) similarNames.push(row[key].toString().trim());
    }

    const doc = {
      diseaseCode: row['Disease code']?.toString().trim(),
      name: row['Disease name']?.toString().trim(),
      similarNames: [...new Set(similarNames)],
    };

    if (!doc.name || !doc.diseaseCode) continue;

    await service.upsert(doc);
  }

  console.log('Import finished');
  await app.close();
}

bootstrap();