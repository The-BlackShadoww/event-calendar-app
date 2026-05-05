import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEventDto) {
    return await this.eventsService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: { status?: string; from?: string; to?: string },
  ) {
    const filters = {
      status: query.status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    };
    return await this.eventsService.findAll(filters);
  }

  @Get(':id')
  async findOne(
    // ParseIntPipe automatically intercepts the string ':id' parameter from the URL,
    // attempts to parse it into a JavaScript number, and automatically throws a
    // 400 Bad Request exception if the string cannot be parsed (e.g., /events/abc).
    // This guarantees that our 'id' argument is safely typed as a number before
    // it ever reaches our route handler or service.
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.eventsService.findOne(id);
  }

  @Patch(':id/cancel-schedule')
  async cancelSchedule(@Param('id', ParseIntPipe) id: number) {
    return await this.eventsService.cancelSchedule(id);
  }

  @Patch(':id/cancel')
  async cancelEvent(@Param('id', ParseIntPipe) id: number) {
    return await this.eventsService.cancelEvent(id);
  }
}
