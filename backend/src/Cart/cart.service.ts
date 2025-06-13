import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { Account } from '@/auth/account/account.entity';
import { Product } from '@/product/product.entity';
import { AddToCartDto } from './dtos/cart.dto';
import { Service } from 'typedi';

@Service()
export class CartService {

  private async getOrCreateCart(username: string): Promise<Cart> {
    const account = await Account.findOne({ where: { username } });
    if (!account) throw new Error('Account not found');
    const cart = await Cart.findOne({
      where: { account: { id: account.id } },
      relations: ['cartItems', 'cartItems.product', 'account']
    });

    if (cart) return cart;

 
    const newCart = new Cart();
    newCart.account = account;
    
    await newCart.save();
    return newCart;
  }

  async addToCart(username: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(username);
    
    const productSlug = addToCartDto.productSlug;
    
    const existingItem = cart.cartItems?.find(
      item => item.product?.slug === productSlug
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
      await existingItem.save();
    } else {

      const product = await Product.findOne({ where: { slug: productSlug } });
      if (!product) throw new Error('Product not found');

      const newItem = new CartItem();
      newItem.quantity = addToCartDto.quantity;
      newItem.cart = cart;
      newItem.product = product;
      
      await newItem.save();
    }

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      relations: ['cartItems', 'cartItems.product', 'account']
    });

    if (!updatedCart) throw new Error('Failed to load cart');
    return updatedCart;
  }

  async viewCart(username: string): Promise<Cart> {

    const account = await Account.findOne({ where: { username } });
    if (!account) throw new Error('Account not found');

    const cart = await Cart.findOne({
      where: { account: { id: account.id } },
      relations: ['cartItems', 'cartItems.product', 'account']
    });

    if (!cart) throw new Error('Cart not found');
    return cart;
  }

  async increaseQuantity(username: string, productSlug: string, amount: number = 1): Promise<Cart> {
    const cart = await this.viewCart(username);
    const item = cart.cartItems?.find(item => item.product?.slug === productSlug);
    
    if (!item) throw new Error('Product not in cart');
    
    item.quantity += amount;
    await item.save();
    
    return this.viewCart(username);
  }

  async decreaseQuantity(username: string, productSlug: string, amount: number = 1): Promise<Cart> {
    const cart = await this.viewCart(username);
    const item = cart.cartItems?.find(item => item.product?.slug === productSlug);
    
    if (!item) throw new Error('Product not in cart');
    
    item.quantity -= amount;
    if (item.quantity <= 0) {
      await item.remove();
    } else {
      await item.save();
    }
    
    return this.viewCart(username);
  }

  async removeItem(username: string, productSlug: string): Promise<Cart> {
    const cart = await this.viewCart(username);
    const item = cart.cartItems?.find(item => item.product?.slug === productSlug);
    
    if (!item) throw new Error('Product not in cart');
    
    await item.remove();
    return this.viewCart(username);
  }
}