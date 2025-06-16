import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { Account } from '@/auth/account/account.entity';
import { Product } from '@/product/product.entity';
import { AddToCartDto } from './dtos/cart.dto';
import { Service } from 'typedi';
import { LessThan } from 'typeorm';
import { EntityNotFoundException } from '@/exceptions/http-exceptions';

@Service()
export class CartService {

  private async getOrCreateCart(username: string): Promise<Cart> {
    const account = await Account.findOne({ where: { username } });
    if (!account) throw new EntityNotFoundException('Account');
    
    const cart = await Cart.findOne({
      where: { account: { id: account.id } },
      relations: ['cartItems', 'cartItems.product', 'account']
    });

    if (cart) return cart;

    const newCart = new Cart();
    newCart.account = account;
    newCart.totalAmount = 0;
    newCart.lastUpdated = new Date();
    await newCart.save();
    return newCart;
  }

  private async calculateTotalAmount(cart: Cart): Promise<number> {
    let total = 0;
    const itemsToRemove: CartItem[] = [];

    if (!cart.cartItems) {
        return Number(total.toFixed(2));
    }

    for (const item of cart.cartItems) {
        const product = await Product.findOne({ where: { id: item.product.id } });
        
        if (!product || !product.active) {
            itemsToRemove.push(item);
        } else if (product.stock < item.quantity) {
            itemsToRemove.push(item);
        } else {
            total += product.price * item.quantity;
        }
    }

    if (itemsToRemove.length > 0) {
        cart.cartItems = cart.cartItems.filter(item => !itemsToRemove.includes(item));
        await cart.save();

        const removedProducts = itemsToRemove.map(item => item.product.name).join(', ');
        throw new Error(`Các sản phẩm sau đã bị xóa khỏi giỏ hàng do không còn tồn tại hoặc không đủ số lượng: ${removedProducts}`);
    }

    return Number(total.toFixed(2));
  }

  private async updateCartTotals(cart: Cart): Promise<Cart> {
    cart.totalAmount = await this.calculateTotalAmount(cart);
    cart.lastUpdated = new Date();
    await cart.save();
    return cart;
  }

  async addToCart(username: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(username);
    const product = await Product.findOne({ where: { slug: addToCartDto.productSlug } });
    
    if (!product) {
      throw new EntityNotFoundException('Product');
    }

    if (!product.active) {
      throw new Error('Sản phẩm này hiện không khả dụng');
    }

    if (product.stock < addToCartDto.quantity) {
      throw new Error(`Số lượng trong kho không đủ. Chỉ còn ${product.stock} sản phẩm`);
    }

    const existingItem = cart.cartItems?.find(
      item => item.product?.slug === addToCartDto.productSlug
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (newQuantity > product.stock) {
        throw new Error(`Không thể thêm. Tổng số lượng (${newQuantity}) vượt quá số lượng trong kho (${product.stock})`);
      }
      existingItem.quantity = newQuantity;
      await existingItem.save();
    } else {
      const newItem = new CartItem();
      newItem.quantity = addToCartDto.quantity;
      newItem.cart = cart;
      newItem.product = product;
      await newItem.save();
    }

    return this.updateCartTotals(cart);
  }

  async viewCart(username: string): Promise<Cart> {
    const account = await Account.findOne({ where: { username } });
    if (!account) throw new EntityNotFoundException('Account');

    const cart = await Cart.findOne({
      where: { account: { id: account.id } },
      relations: ['cartItems', 'cartItems.product', 'account']
    });

    if (!cart) throw new EntityNotFoundException('Cart');
    return this.updateCartTotals(cart);
  }

  async increaseQuantity(username: string, productSlug: string, amount: number = 1): Promise<Cart> {
    const cart = await this.viewCart(username);
    const item = cart.cartItems?.find(item => item.product?.slug === productSlug);
    
    if (!item) throw new Error('Sản phẩm không có trong giỏ hàng');
    
    const product = await Product.findOne({ where: { id: item.product.id } });
    if (!product) throw new EntityNotFoundException('Product');

    if (item.quantity + amount > product.stock) {
      throw new Error(`Không thể tăng số lượng. Kho chỉ còn ${product.stock} sản phẩm`);
    }
    
    item.quantity += amount;
    await item.save();
    
    return this.updateCartTotals(cart);
  }

  async decreaseQuantity(username: string, productSlug: string, amount: number = 1): Promise<Cart> {
    const cart = await this.viewCart(username);
    const item = cart.cartItems?.find(item => item.product?.slug === productSlug);
    
    if (!item) throw new Error('Sản phẩm không có trong giỏ hàng');
    
    item.quantity -= amount;
    if (item.quantity <= 0) {
      await item.remove();
    } else {
      await item.save();
    }
    
    return this.updateCartTotals(cart);
  }

  async removeItem(username: string, productSlug: string): Promise<Cart> {
    const cart = await this.viewCart(username);
    const item = cart.cartItems?.find(item => item.product?.slug === productSlug);
    
    if (!item) throw new Error('Sản phẩm không có trong giỏ hàng');
    
    await item.remove();
    return this.updateCartTotals(cart);
  }

  async clearCart(username: string): Promise<void> {
    const cart = await this.viewCart(username);
    
    if (cart.cartItems) {
      for (const item of cart.cartItems) {
        await item.remove();
      }
    }
    
    cart.totalAmount = 0;
    cart.lastUpdated = new Date();
    await cart.save();
  }

  async cleanupAbandonedCarts(hours: number = 72): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const abandonedCarts = await Cart.find({
      where: {
        lastUpdated: LessThan(cutoffDate)
      },
      relations: ['cartItems']
    });

    for (const cart of abandonedCarts) {
      if (cart.cartItems) {
        for (const item of cart.cartItems) {
          await item.remove();
        }
      }
      await cart.remove();
    }
  }

  async validateCartPrices(username: string): Promise<{
    hasChanges: boolean;
    updatedCart?: Cart;
  }> {
    const cart = await this.viewCart(username);
    let hasChanges = false;

    for (const item of cart.cartItems) {
      const product = await Product.findOne({ where: { id: item.product.id } });
      if (product && product.price !== item.product.price) {
        hasChanges = true;
        item.product.price = product.price;
        await item.save();
      }
    }

    if (hasChanges) {
      const updatedCart = await this.updateCartTotals(cart);
      return { hasChanges: true, updatedCart };
    }

    return { hasChanges: false };
  }
}