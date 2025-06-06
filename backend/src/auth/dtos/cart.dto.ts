export class AddToCartDto {
  productId: string;
  quantity: number;
}

export class CartItemDto {
  productId: string;
  quantity: number;
  price: number;
}