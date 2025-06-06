import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { AddToCartDto } from '../auth/dtos/cart.dto';
import { Service } from 'typedi';

@Service()
export class CartService {
  constructor(
    private readonly cartRepository: Repository<Cart>,
    private readonly cartItemRepository: Repository<CartItem>
  ) {}

  private async getOrCreateCart(accountId: string): Promise<Cart> {
    const cart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItems')
      .leftJoinAndSelect('cartItems.product', 'product')
      .leftJoinAndSelect('cart.account', 'account')
      .where('account.id = :accountId', { accountId })
      .getOne();

    if (cart) return cart;


    const newCart = this.cartRepository.create();
    newCart.account = { id: accountId } as any;
    return this.cartRepository.save(newCart);
  }

  async addToCart(accountId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(accountId);
    

    const productId = String(addToCartDto.productId);
    

    const existingItem = cart.cartItems?.find(
      item => item.product?.id === productId
    );

    if (existingItem) {

      existingItem.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        quantity: addToCartDto.quantity,
        cart: cart,
        product: { id: productId } as any
      });
      await this.cartItemRepository.save(newItem);
    }


    const updatedCart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItems')
      .leftJoinAndSelect('cartItems.product', 'product')
      .leftJoinAndSelect('cart.account', 'account')
      .where('cart.id = :id', { id: cart.id })
      .getOne();

    if (!updatedCart) throw new Error('Failed to load cart');
    return updatedCart;
  }

  async viewCart(accountId: string): Promise<Cart> {
    const cart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItems')
      .leftJoinAndSelect('cartItems.product', 'product')
      .leftJoinAndSelect('cart.account', 'account')
      .where('account.id = :accountId', { accountId })
      .getOne();

    if (!cart) throw new Error('Cart not found');
    return cart;
  }

  async increaseQuantity(accountId: string, productId: string, amount: number = 1): Promise<Cart> {
    const cart = await this.viewCart(accountId);
    const item = cart.cartItems?.find(item => item.product?.id === String(productId));
    
    if (!item) throw new Error('Product not in cart');
    
    item.quantity += amount;
    await this.cartItemRepository.save(item);
    
    return this.viewCart(accountId);
  }

  async decreaseQuantity(accountId: string, productId: string, amount: number = 1): Promise<Cart> {
    const cart = await this.viewCart(accountId);
    const item = cart.cartItems?.find(item => item.product?.id === String(productId));
    
    if (!item) throw new Error('Product not in cart');
    
    item.quantity -= amount;
    if (item.quantity <= 0) {
      await this.cartItemRepository.remove(item);
    } else {
      await this.cartItemRepository.save(item);
    }
    
    return this.viewCart(accountId);
  }

  async removeItem(accountId: string, productId: string): Promise<Cart> {
    const cart = await this.viewCart(accountId);
    const item = cart.cartItems?.find(item => item.product?.id === String(productId));
    
    if (!item) throw new Error('Product not in cart');
    
    await this.cartItemRepository.remove(item);
    return this.viewCart(accountId);
  }
}