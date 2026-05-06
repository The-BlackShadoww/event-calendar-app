import {
  Controller,
  Post,
  Patch,
  Body,
  Delete,
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
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

  @Delete(':id')
  async deleteEvent(@Param('id', ParseIntPipe) id: number) {
    return await this.eventsService.deleteEvent(id);
  }
}
