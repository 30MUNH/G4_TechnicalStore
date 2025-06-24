import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch orders from backend
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrders();
            if (response.orders) {
                setOrders(response.orders);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const createOrder = async (customerDetails) => {
        try {
            setLoading(true);
            const createOrderDto = {
                shippingAddress: `${customerDetails.address}, ${customerDetails.commune}, ${customerDetails.ward}, ${customerDetails.city}`,
                note: customerDetails.note || ''
            };
            
            const response = await orderService.createOrder(createOrderDto);
            await fetchOrders(); // Refresh orders list
            return response.order;
        } catch (err) {
            setError('Failed to create order');
            console.error('Error creating order:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus, cancelReason = '') => {
        try {
            setLoading(true);
            const updateOrderDto = {
                status: newStatus,
                cancelReason: newStatus === 'Đã hủy' ? cancelReason : undefined
            };
            
            const response = await orderService.updateOrderStatus(orderId, updateOrderDto);
            await fetchOrders(); // Refresh orders list
            return response.order;
        } catch (err) {
            setError('Failed to update order status');
            console.error('Error updating order status:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId, cancelReason) => {
        return updateOrderStatus(orderId, 'Đã hủy', cancelReason);
    };

    const getOrderById = async (orderId) => {
        try {
            setLoading(true);
            const response = await orderService.getOrderById(orderId);
            return response.order;
        } catch (err) {
            setError('Failed to fetch order details');
            console.error('Error fetching order details:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getOrdersByStatus = (status) => {
        return orders.filter(order => order.status === status);
    };

    const getOrderStatistics = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderStatistics();
            return response.statistics;
        } catch (err) {
            setError('Failed to fetch order statistics');
            console.error('Error fetching order statistics:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        setOrders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        getOrderById,
        getOrdersByStatus,
        getOrderStatistics,
        fetchOrders,
        loading,
        error
    };
}; 