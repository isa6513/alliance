import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty()
  status: string;

  constructor(status: string) {
    this.status = status;
  }
}
