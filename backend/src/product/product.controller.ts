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
  Req,
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
  async create(@Req() req: any): Promise<Product> {
    return this.productService.createProduct(req.body);
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
    @Req() req: any,
  ): Promise<Product> {
    return this.productService.updateProduct(id, req.body);
  }

  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.productService.deleteProduct(id);
  }
}
