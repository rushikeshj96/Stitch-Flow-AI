import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { storeService } from '../../services/storeService.js';
import { formatCurrency } from '../../utils/helpers.js';

const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

export default function AdminStoreOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await storeService.getAdminOrders();
            setOrders(response.data?.data || []);
        } catch (error) {
            toast.error(error?.message || 'Failed to fetch store orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateOrder = async (id, payload) => {
        try {
            await storeService.updateAdminOrder(id, payload);
            setOrders((prev) => prev.map((order) => order._id === id ? { ...order, ...payload } : order));
            toast.success('Order updated');
        } catch (error) {
            toast.error(error?.message || 'Failed to update order');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="page-title">Store Orders</h1>
                <p className="page-subtitle">View online purchases, payment status, and delivery progress.</p>
            </div>

            {loading ? (
                <div className="card p-8 text-center text-neutral-500 dark:text-neutral-400">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="card p-8 text-center text-neutral-500 dark:text-neutral-400">No store orders available.</div>
            ) : (
                <div className="table-wrapper bg-white dark:bg-neutral-900">
                    <table className="table min-w-[1120px]">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Products</th>
                                <th>Total</th>
                                <th>Payment Status</th>
                                <th>Order Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-semibold">{order.orderId}</td>
                                    <td>
                                        <p className="font-medium text-neutral-900 dark:text-white">{order.customerName}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{order.phoneNumber}</p>
                                    </td>
                                    <td>{order.products.map((item) => `${item.productName} x${item.quantity}`).join(', ')}</td>
                                    <td className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(order.totalAmount)}</td>
                                    <td>
                                        <select className="input" value={order.paymentStatus} onChange={(e) => updateOrder(order._id, { paymentStatus: e.target.value })}>
                                            {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="input" value={order.orderStatus} onChange={(e) => updateOrder(order._id, { orderStatus: e.target.value })}>
                                            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
