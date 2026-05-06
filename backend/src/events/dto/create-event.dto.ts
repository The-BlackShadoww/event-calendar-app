import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDate,
  MinDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date())
  scheduledAt: Date;
}
