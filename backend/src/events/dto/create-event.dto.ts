import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDate,
  IsDateString,
  IsIn,
  IsBoolean,
  IsInt,
  IsNumber,
  MinDate,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isEndedAtAfterScheduledAt', async: false })
class IsEndedAtAfterScheduledAtConstraint implements ValidatorConstraintInterface {
  validate(endedAt: string, args: ValidationArguments): boolean {
    const dto = args.object as CreateEventDto & { scheduledAt?: Date | string };

    if (!endedAt || !dto.scheduledAt) {
      return true;
    }

    const scheduledAt =
      dto.scheduledAt instanceof Date
        ? dto.scheduledAt
        : new Date(dto.scheduledAt);
    const endedAtDate = new Date(endedAt);

    if (
      Number.isNaN(scheduledAt.getTime()) ||
      Number.isNaN(endedAtDate.getTime())
    ) {
      return true;
    }

    return endedAtDate.getTime() > scheduledAt.getTime();
  }

  defaultMessage(): string {
    return 'endedAt must be after scheduledAt';
  }
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PHYSICAL', 'ONLINE'])
  locationType: 'PHYSICAL' | 'ONLINE';

  @IsString()
  @IsNotEmpty()
  locationValue: string;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ticketPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date())
  scheduledAt: Date;

  /**
   * The ISO timestamp when the event ends. This needs cross-field validation
   * because format validation alone cannot guarantee the end time is after
   * `scheduledAt`.
   */
  @IsDateString()
  @Validate(IsEndedAtAfterScheduledAtConstraint)
  endedAt: string;
}
