import { ApiProperty } from '@nestjs/swagger';

export class TimeSpentForUserDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  timeSpentLast7Days: number;
}
