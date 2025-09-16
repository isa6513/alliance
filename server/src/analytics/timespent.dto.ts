import { ApiProperty } from '@nestjs/swagger';

export class TimeSpentForUserDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  timeSpent: number;
}
