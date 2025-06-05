export class AddToCartDto {
  productId: number;
  quantity: number;
}

export class CartItemDto {
  productId: number;
  quantity: number;
  price: number;
}