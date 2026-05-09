import * as xlsx from 'xlsx';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import * as path from 'path';

function mapRelation(value: string) {
  const v = value?.toLowerCase();

  if (v.includes('contra')) return 'Contraindication';
  if (v.includes('caution')) return 'Caution';
  if (v.includes('safe')) return 'Safe';
  if (v.includes('side')) return 'Side-Effect';

  return 'Indication';
}

function mapSeverity(value: string) {
  const v = value?.toLowerCase();

  if (v.includes('contra')) return 'contraindicated';
  if (v.includes('severe')) return 'severe';
  if (v.includes('moderate')) return 'moderate';

  return 'mild';
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const drugModel = app.get('DrugModel');
  const diseaseModel = app.get('DiseaseModel');
  const interactionModel = app.get('DrugDiseaseInteractionModel');

  const filePath = path.join(__dirname, 'Dimension.xlsx');

  const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets['Dim5'];

  const rows = xlsx.utils.sheet_to_json<any>(sheet);

  for (const row of rows) {
    const drugCode = row['Drug Code']?.toString().trim();
    const diseaseCode = row['Disease Code']?.toString().trim();

    if (!drugCode || !diseaseCode) continue;

    const drug = await drugModel.findOne({ senomeCode: drugCode });
    const disease = await diseaseModel.findOne({ diseaseCode });

    if (!drug || !disease) {
      console.warn(`Missing relation entities: ${drugCode} / ${diseaseCode}`);
      continue;
    }

    await interactionModel.findOneAndUpdate(
      {
        drug: drug._id,
        disease: disease._id,
        relation: mapRelation(row['Relation']),
      },
      {
        drug: drug._id,
        disease: disease._id,
        relation: mapRelation(row['Relation']),
        severity: mapSeverity(row['Severity']),
        description: row['Description'],
        recommendedDose: row['Recommended Dose'],
        reasoning: row['Reasoning'],
        mechanism: row['Mechanism'],
        source: 'Dim5',
      },
      {
        upsert: true,
        new: true,
      },
    );

    console.log(`Imported drug-disease relation: ${drugCode} -> ${diseaseCode}`);
  }

  console.log('Drug disease interactions completed');

  await app.close();
}

bootstrap();