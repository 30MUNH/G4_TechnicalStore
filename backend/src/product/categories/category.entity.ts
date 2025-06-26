// src/product/category.entity.ts

import { NamedEntity } from '@/common/NamedEntity';
import { Entity, OneToMany } from 'typeorm';
import { Product } from '../product.entity';

@Entity('categories')
export class Category extends NamedEntity{
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
