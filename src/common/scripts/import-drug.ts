import * as xlsx from 'xlsx';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import * as path from 'path';
import { DrugService } from 'src/modules/drug/drug.service';
import { DrugForm, DrugRoute } from 'src/modules/drug/schemas/drug.schema';


function normalizeForm(form?: string) {
  if (!form) return 'other';

  const value = form.toLowerCase();

  if (value.includes('tablet')) return 'tablet';
  if (value.includes('capsule')) return 'capsule';
  if (value.includes('syrup')) return 'syrup';
  if (value.includes('inject')) return 'injection';
  if (value.includes('cream')) return 'cream';
  if (value.includes('drop')) return 'drops';
  if (value.includes('patch')) return 'patch';
  if (value.includes('inhal')) return 'inhaler';
  if(value.includes('suppository')) return 'suppository';

  return 'other';
}

function normalizeRoute(route?: string) {
  if (!route) return 'other';

  const value = route.toLowerCase();

  if (value.includes('oral')) return 'oral';
  if (value.includes('iv')) return 'IV';
  if (value.includes('im')) return 'IM';
  if (value.includes('sc')) return 'SC';
  if (value.includes('topical')) return 'topical';
  if (value.includes('inhal')) return 'inhalation';
  if (value.includes("rectal")) return 'rectal';
  if(value.includes("sublingual")) return "sublingual"

  return "other"
}


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const service = app.get(DrugService);

  const filePath = path.join(__dirname, 'Dimension.xlsx');

  const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets['Dim1'];

  console.log(sheet)
  const rows = xlsx.utils.sheet_to_json<any>(sheet);

  console.log(rows.length)
  for (const row of rows) {
    const tradeName = row['Trade Name']?.toString().trim();
    const genericName = row['Generic Name']?.toString().trim();

    if (!tradeName || !genericName) continue;

    const synonyms: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const key = `Synonym${i}`;

      if (row[key]) {
        synonyms.push(row[key].toString().trim());
      }
    }

    await service.create({
      senomeCode: row['Drug Code']?.toString().trim(),
      tradeName,
      genericName,
      synonyms,
      similarTradeNames: synonyms,
      activeIngredients: [
        {
          name: genericName,
          strength: row['Strength']?.toString().trim(),
        },
      ],
      dose: row['Dose']?.toString().trim() || '',
      strength: row['Strength']?.toString().trim(),
      form: normalizeForm(row['Form']) as DrugForm,
      route: normalizeRoute(row['Route']) as DrugRoute,
      manufacturer: row['Manufacturer']?.toString().trim(),
      atcCode: row['ATC Code']?.toString().trim(),
      description: row['Description']?.toString().trim(),
      rawData: row,
    });

    console.log(`Imported drug: ${tradeName}`);
  }

  console.log('Drug import completed');

  await app.close();
}

bootstrap();