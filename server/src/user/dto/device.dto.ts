import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserDevice } from '../entities/user-device.entity';

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expoPushToken: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  deviceId?: string;
}

export class UserDeviceDto extends PickType(UserDevice, ['id']) {}
