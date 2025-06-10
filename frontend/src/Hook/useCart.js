import { useState, useCallback, createContext, useContext } from 'react';

export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [orders, setOrders] = useState([]);


    const addToCart = useCallback((product, quantity = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);

            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prev, { product, quantity }];
        });
    }, []);

    const updateQuantity = useCallback((productId, quantity) => {
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [cartItems]);

    const getTax = useCallback(() => {
        return getCartTotal() * 0.1;
    }, [getCartTotal]);

    const getShipping = useCallback(() => {
        return getCartTotal() > 25000000 ? 0 : 200000; // Free shipping over 25 million VND
    }, [getCartTotal]);

    const getFinalTotal = useCallback(() => {
        return getCartTotal() + getTax() + getShipping();
    }, [getCartTotal, getTax, getShipping]);

    const checkout = useCallback((customer) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            items: [...cartItems],
            total: getFinalTotal(),
            status: 'pending',
            orderDate: new Date(),
            deliveryAddress: `${customer.address}, ${customer.city} ${customer.zipCode}`,
            paymentMethod: 'Credit Card'
        };

        setOrders(prev => [newOrder, ...prev]);
        clearCart();

        return newOrder;
    }, [cartItems, getFinalTotal, clearCart]);



    return {
        cartItems,
        orders,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getTax,
        getShipping,
        getFinalTotal,
        checkout
    };
};

// Create Cart Context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const cartData = useCart();

    return (
        <CartContext.Provider value={cartData}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
}; 