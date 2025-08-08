import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuctionsService } from './auctions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly service: AuctionsService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const data = {
      title: body.title,
      description: body.description,
      startPrice: Number(body.startPrice),
      minIncrement: Number(body.minIncrement),
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
    };
    const imagePath = file ? `/uploads/${file.filename}` : undefined;
    return this.service.create(data, imagePath);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = { ...body };
    if (data.startPrice) data.startPrice = Number(data.startPrice);
    if (data.minIncrement) data.minIncrement = Number(data.minIncrement);
    if (data.startAt) data.startAt = new Date(data.startAt);
    if (data.endAt) data.endAt = new Date(data.endAt);
    return this.service.update(+id, data);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.service.close(+id);
  }
}
