import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}
