import { IsString, IsInt, Min, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productSlug: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CartItemDto {
  @IsString()
  productSlug: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}