import { PickType } from '@nestjs/swagger';
import { AiDetectionResult } from '../entities/ai-detection-result.entity';

export class AiDetectionResultDto extends PickType(AiDetectionResult, [
  'id',
  'fieldPath',
  'status',
  'aiProbability',
  'modelVersion',
  'createdAt',
  'updatedAt',
] as const) {}
