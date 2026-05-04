import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  MinDate,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Objects (DTOs) define the structure and shape of data that is sent over the network.
 * They serve as a strict contract for incoming HTTP requests.
 *
 * We validate at this layer (using decorators like class-validator) to ensure that our application
 * only accepts properly formatted and logically sound data. This provides a "fail-fast" mechanism
 * acting as a first line of defense. It prevents malformed data or malicious payloads from
 * ever reaching our controllers, services, or the database, keeping our business logic clean
 * and predictable.
 */
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // We use @Type to transform the incoming JSON string into a Date object so that
  // @MinDate can correctly compare it against a Date object.
  @Type(() => Date)
  @IsDateString()
  @MinDate(new Date())
  scheduledAt: Date;
}
