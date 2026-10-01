import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepo.create(dto);
    return this.reviewRepo.save(review);
  }

  async findByRoom(roomId: number): Promise<Review[]> {
    return this.reviewRepo.find({ where: { roomId } });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    return review;
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepo.remove(review);
  }
}
