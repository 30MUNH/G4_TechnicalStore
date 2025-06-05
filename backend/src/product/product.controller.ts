import { Service } from 'typedi';
import {
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  OnUndefined,
} from 'routing-controllers';
import { Inject } from 'typedi';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto';
import { Product } from './product.entity';
import { EntityNotFoundException } from '@/exceptions/http-exceptions';

@Service()
@JsonController('/products')
export class ProductController {
  constructor(
    @Inject(() => ProductService)
    private readonly productService: ProductService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(body);
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.getAllProducts();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.getProductById(id);
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateProduct(id, body);
  }

  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.productService.deleteProduct(id);
  }
}
