// src/product/category.service.ts

import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Service()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    console.log('DATA TYPE:', Array.isArray(data)); 
    const category = this.categoryRepo.create(data); 
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  async findWithProducts(): Promise<Category[]> {
    return this.categoryRepo.find({
      relations: ["products"]
    });
  }

  async findById(id: number): Promise<Category> {
    return this.categoryRepo.findOneByOrFail({ id });
  }

  async findByIdWithProducts(id: number): Promise<Category> {
    return this.categoryRepo.findOneOrFail({
      where: { id },
      relations: ["products"]
    });
  }

  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    Object.assign(category, data);
    return this.categoryRepo.save(category);
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepo.delete(id);
  }
}
