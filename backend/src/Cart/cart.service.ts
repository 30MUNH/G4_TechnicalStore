import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { Account } from '@/auth/account/account.entity';
import { Product } from '@/product/product.entity';
import { AddToCartDto } from './dtos/cart.dto';
import { Service } from 'typedi';
import { DbConnection } from '@/database/dbConnection';
import { EntityNotFoundException, BadRequestException } from '@/exceptions/http-exceptions';

@Service()
export class CartService {
  private validateQuantity(quantity: number, action: 'increase' | 'decrease'): void {
    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('Số lượng phải là số nguyên');
    }
    
    if (quantity <= 0) {
      throw new BadRequestException(`Số lượng ${action === 'increase' ? 'tăng' : 'giảm'} phải lớn hơn 0`);
    }

    if (quantity > 99) {
      throw new BadRequestException(`Số lượng ${action === 'increase' ? 'tăng' : 'giảm'} không được vượt quá 99`);
    }
  }

  private async getOrCreateCart(username: string): Promise<Cart> {
    try {
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
      await newCart.save();
      return newCart;
    } catch (error) {
      console.error('❌ [CartService] Error in getOrCreateCart:', error);
      throw error;
    }
  }

  private async calculateTotalAmount(cart: Cart): Promise<number> {
    try {
      let total = 0;
      const itemsToRemove: CartItem[] = [];

      if (!cart.cartItems) {
        return Number(total.toFixed(2));
      }

      for (const item of cart.cartItems) {
        const product = await Product.findOne({ where: { id: item.product.id } });
        
        if (!product || !product.isActive) {
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
        throw new BadRequestException(`Các sản phẩm sau đã bị xóa khỏi giỏ hàng do không còn tồn tại hoặc không đủ số lượng: ${removedProducts}`);
      }

      return Number(total.toFixed(2));
    } catch (error) {
      console.error('❌ [CartService] Error in calculateTotalAmount:', error);
      throw error;
    }
  }

  private async updateCartTotals(cart: Cart): Promise<Cart> {
    try {
      cart.totalAmount = await this.calculateTotalAmount(cart);
      await cart.save();
      return cart;
    } catch (error) {
      console.error('❌ [CartService] Error in updateCartTotals:', error);
      throw error;
    }
  }

  async addToCart(username: string, addToCartDto: AddToCartDto): Promise<Cart> {
    try {
      this.validateQuantity(addToCartDto.quantity, 'increase');

      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        console.log('🛒 [CartService] Adding to cart:', { username, product: addToCartDto.productId, quantity: addToCartDto.quantity });
        
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        let cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'account']
        });

        if (!cart) {
          cart = new Cart();
          cart.account = account;
          cart.totalAmount = 0;
          cart = await transactionalEntityManager.save(cart);
          console.log('✅ [CartService] Created new cart for user:', username);
        }
        
        // Lock the product row for update
        const product = await transactionalEntityManager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: addToCartDto.productId })
          .getOne();

        if (!product) {
          throw new EntityNotFoundException('Product');
        }

        if (!product.isActive) {
          throw new BadRequestException('Sản phẩm này hiện không khả dụng');
        }

        const existingItem = cart.cartItems?.find(
          item => item.product?.id === addToCartDto.productId
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + addToCartDto.quantity;
          if (newQuantity > product.stock) {
            throw new BadRequestException(`Không thể thêm. Tổng số lượng (${newQuantity}) vượt quá số lượng trong kho (${product.stock})`);
          }
          existingItem.quantity = newQuantity;
          await transactionalEntityManager.save(existingItem);
          console.log('✅ [CartService] Updated existing item quantity:', { product: product.name, newQuantity });
        } else {
          const newItem = new CartItem();
          newItem.quantity = addToCartDto.quantity;
          newItem.cart = cart;
          newItem.product = product;
          await transactionalEntityManager.save(newItem);
          console.log('✅ [CartService] Added new item to cart:', { product: product.name, quantity: addToCartDto.quantity });
        }

        // Reload cart with updated items within transaction to get fresh data
        const updatedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!updatedCart) {
          throw new Error('Failed to reload cart after update');
        }

        // Calculate total with fresh cart items
        let total = 0;
        if (updatedCart.cartItems) {
          for (const item of updatedCart.cartItems) {
            const product = await transactionalEntityManager.findOne(Product, { where: { id: item.product.id } });
            if (product && product.isActive) {
              total += product.price * item.quantity;
            }
          }
        }
        
        updatedCart.totalAmount = Number(total.toFixed(2));
        await transactionalEntityManager.save(updatedCart);
        
        console.log('✅ [CartService] Cart updated successfully:', { 
          totalAmount: updatedCart.totalAmount,
          cartItemsCount: updatedCart.cartItems?.length || 0
        });
        
        console.log('🛒 [CartService] Final cart data:', {
          id: updatedCart.id,
          totalAmount: updatedCart.totalAmount,
          cartItemsCount: updatedCart.cartItems?.length,
          cartItems: updatedCart.cartItems?.map(item => ({
            id: item.id,
            quantity: item.quantity,
            productName: item.product?.name,
            productId: item.product?.id
          }))
        });
        
        return updatedCart;
      });
    } catch (error) {
      console.error('❌ [CartService] Error in addToCart:', error);
      throw error;
    }
  }

  async viewCart(username: string): Promise<Cart> {
    const account = await Account.findOne({ where: { username } });
    if (!account) throw new EntityNotFoundException('Account');

    const cart = await Cart.findOne({
      where: { account: { id: account.id } },
      relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
    });

    if (!cart) throw new EntityNotFoundException('Cart');
    
    const updatedCart = await this.updateCartTotals(cart);
    
    console.log('🛒 [CartService] View cart data:', {
      id: updatedCart.id,
      totalAmount: updatedCart.totalAmount,
      cartItemsCount: updatedCart.cartItems?.length,
      cartItems: updatedCart.cartItems?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        productName: item.product?.name,
        productSlug: item.product?.slug
      }))
    });
    
    return updatedCart;
  }

  async increaseQuantity(username: string, productId: string, amount: number = 1): Promise<Cart> {
    try {
      this.validateQuantity(amount, 'increase');

      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        console.log('🛒 [CartService] Increasing quantity:', { username, product: productId, amount });
        
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        const item = cart.cartItems?.find(item => item.product?.id === productId);
        
        if (!item) {
          throw new BadRequestException('Sản phẩm không có trong giỏ hàng');
        }
        
        // Lock the product row for update
        const product = await transactionalEntityManager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: item.product.id })
          .getOne();

        if (!product) throw new EntityNotFoundException('Product');
        if (!product.isActive) throw new BadRequestException('Sản phẩm này hiện không khả dụng');

        if (item.quantity + amount > product.stock) {
          throw new BadRequestException(`Không thể tăng số lượng. Kho chỉ còn ${product.stock} sản phẩm`);
        }
        
        item.quantity += amount;
        await transactionalEntityManager.save(item);
        console.log('✅ [CartService] Increased quantity successfully:', { product: product.name, newQuantity: item.quantity });
        
        // Reload cart with fresh data after updating
        const reloadedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!reloadedCart) {
          throw new Error('Failed to reload cart after increase');
        }
        
        // Calculate total with fresh cart items
        let total = 0;
        if (reloadedCart.cartItems) {
          for (const cartItem of reloadedCart.cartItems) {
            const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id } });
            if (product && product.isActive) {
              total += product.price * cartItem.quantity;
            }
          }
        }
        
        reloadedCart.totalAmount = Number(total.toFixed(2));
        await transactionalEntityManager.save(reloadedCart);
        
        console.log('✅ [CartService] Cart updated after increase:', { 
          totalAmount: reloadedCart.totalAmount,
          cartItemsCount: reloadedCart.cartItems?.length || 0
        });
        
        return reloadedCart;
      });
    } catch (error) {
      console.error('❌ [CartService] Error in increaseQuantity:', error);
      throw error;
    }
  }

  async decreaseQuantity(username: string, productId: string, amount: number = 1): Promise<Cart> {
    try {
      this.validateQuantity(amount, 'decrease');

      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        console.log('🛒 [CartService] Decreasing quantity:', { username, product: productId, amount });
        
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        const item = cart.cartItems?.find(item => item.product?.id === productId);
        
        if (!item) {
          throw new BadRequestException('Sản phẩm không có trong giỏ hàng');
        }
        
        item.quantity -= amount;
        if (item.quantity <= 0) {
          await transactionalEntityManager.remove(item);
          console.log('✅ [CartService] Removed item from cart:', { product: item.product.name });
        } else {
          await transactionalEntityManager.save(item);
          console.log('✅ [CartService] Decreased quantity successfully:', { product: item.product.name, newQuantity: item.quantity });
        }
        
        // Reload cart with fresh data after updating
        const reloadedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!reloadedCart) {
          throw new Error('Failed to reload cart after decrease');
        }
        
        // Calculate total with fresh cart items
        let total = 0;
        if (reloadedCart.cartItems) {
          for (const cartItem of reloadedCart.cartItems) {
            const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id } });
            if (product && product.isActive) {
              total += product.price * cartItem.quantity;
            }
          }
        }
        
        reloadedCart.totalAmount = Number(total.toFixed(2));
        await transactionalEntityManager.save(reloadedCart);
        
        console.log('✅ [CartService] Cart updated after decrease:', { 
          totalAmount: reloadedCart.totalAmount,
          cartItemsCount: reloadedCart.cartItems?.length || 0
        });
        
        return reloadedCart;
      });
    } catch (error) {
      console.error('❌ [CartService] Error in decreaseQuantity:', error);
      throw error;
    }
  }

  async removeItem(username: string, productId: string): Promise<Cart> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        console.log('🛒 [CartService] Removing item:', { username, product: productId });
        
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        const item = cart.cartItems?.find(item => item.product?.id === productId);
        
        if (!item) {
          throw new BadRequestException('Sản phẩm không có trong giỏ hàng');
        }
        
        await transactionalEntityManager.remove(item);
        console.log('✅ [CartService] Removed item successfully:', { product: item.product.name });
        
        // Reload cart with fresh data after removing item
        const reloadedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!reloadedCart) {
          throw new Error('Failed to reload cart after removing item');
        }
        
        // Calculate total with fresh cart items
        let total = 0;
        if (reloadedCart.cartItems) {
          for (const cartItem of reloadedCart.cartItems) {
            const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id } });
            if (product && product.isActive) {
              total += product.price * cartItem.quantity;
            }
          }
        }
        
        reloadedCart.totalAmount = Number(total.toFixed(2));
        await transactionalEntityManager.save(reloadedCart);
        
        console.log('✅ [CartService] Cart updated after remove:', { 
          totalAmount: reloadedCart.totalAmount,
          remainingItemsCount: reloadedCart.cartItems?.length || 0
        });
        
        return reloadedCart;
      });
    } catch (error) {
      console.error('❌ [CartService] Error in removeItem:', error);
      throw error;
    }
  }

  async clearCart(username: string): Promise<void> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        console.log('🛒 [CartService] Clearing cart:', { username });
        
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        if (cart.cartItems) {
          await transactionalEntityManager.remove(cart.cartItems);
        }
        
        cart.totalAmount = 0;
        await transactionalEntityManager.save(cart);
        console.log('✅ [CartService] Cart cleared successfully');
      });
    } catch (error) {
      console.error('❌ [CartService] Error in clearCart:', error);
      throw error;
    }
  }

  async validateCartPrices(username: string): Promise<{
    hasChanges: boolean;
    updatedCart?: Cart;
  }> {
    try {
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
        console.log('✅ [CartService] Cart prices updated successfully');
        return { hasChanges: true, updatedCart };
      }

      return { hasChanges: false };
    } catch (error) {
      console.error('❌ [CartService] Error in validateCartPrices:', error);
      throw error;
    }
  }
}