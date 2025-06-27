// // src/product/category.controller.ts

// import {
//   JsonController,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Param,
//   Body,
//   HttpCode,
//   OnUndefined,
// } from 'routing-controllers';
// import { Inject } from 'typedi';
// import { CategoryService } from './category.service';
// import { Category } from './category.entity';
// import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

// @JsonController('/categories')
// export class CategoryController {
//   constructor(
//     @Inject(() => CategoryService)
//     private readonly categoryService: CategoryService
//   ) {}

//   @Get()
//   async getAll(): Promise<Category[]> {
//     return this.categoryService.findAll();
//   }

//   @Get('/with-products')
//   async getAllWithProducts(): Promise<Category[]> {
//     return this.categoryService.findWithProducts();
//   }

//   @Get('/:id')
//   async getOne(@Param('id') id: number): Promise<Category> {
//     return this.categoryService.findById(id);
//   }

//   @Get('/:id/with-products')
//   async getOneWithProducts(@Param('id') id: number): Promise<Category> {
//     return this.categoryService.findByIdWithProducts(id);
//   }

//   @Post()
//   @HttpCode(201)
//   async create(@Body() body: CreateCategoryDto): Promise<Category> {
//     return this.categoryService.create(body);
//   }

//   @Put('/:id')
//   async update(
//     @Param('id') id: number,
//     @Body() body: UpdateCategoryDto
//   ): Promise<Category> {
//     return this.categoryService.update(id, body);
//   }

//   @Delete('/:id')
//   @OnUndefined(204)
//   async delete(@Param('id') id: number): Promise<void> {
//     await this.categoryService.delete(id);
//   }
// }
