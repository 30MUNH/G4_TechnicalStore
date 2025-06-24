// src/product/category.entity.ts

import { NamedEntity } from '@/common/NamedEntity';
import { Entity } from 'typeorm';

@Entity('categories')
export class Category extends NamedEntity{
}
