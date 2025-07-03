import { IsString, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CartItemResponseDto {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    url?: string;
    stock: number;
    category?: string;
    isActive: boolean;
  };
}

export class CartResponseDto {
  id: string;
  totalAmount: number;
  cartItems: CartItemResponseDto[];
  account: {
    id: string;
    username: string;
  };
}