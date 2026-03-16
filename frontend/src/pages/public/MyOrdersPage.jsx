import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { storeService } from '../../services/storeService.js';
import { formatCurrency } from '../../utils/helpers.js';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contact, setContact] = useState(() => {
        try {
            const saved = localStorage.getItem('sf_store_last_order_contact');
            return saved ? JSON.parse(saved) : { email: '', phoneNumber: '' };
        } catch (error) {
            return { email: '', phoneNumber: '' };
        }
    });

    const loadOrders = async (params = contact) => {
        setLoading(true);
        try {
            const response = await storeService.getMyOrders(params);
            setOrders(response.data?.data || []);
        } catch (error) {
            toast.error(error?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contact.email || contact.phoneNumber) {
            loadOrders(contact);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!contact.email && !contact.phoneNumber) {
            toast.error('Enter email or phone number');
            return;
        }
        localStorage.setItem('sf_store_last_order_contact', JSON.stringify(contact));
        loadOrders(contact);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">My Orders</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Track your online store purchases.</p>
            </div>

            <form onSubmit={handleSubmit} className="card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="email" className="input" placeholder="Email" value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} />
                <input className="input" placeholder="Phone Number" value={contact.phoneNumber} onChange={(e) => setContact((p) => ({ ...p, phoneNumber: e.target.value }))} />
                <button className="btn-primary">Load Orders</button>
            </form>

            {loading ? <p className="text-neutral-500">Loading orders...</p> : null}

            {orders.length === 0 && !loading ? (
                <div className="card p-10 text-center text-neutral-500 dark:text-neutral-400">No orders found.</div>
            ) : (
                <div className="table-wrapper bg-white dark:bg-neutral-900">
                    <table className="table min-w-[840px]">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Products</th>
                                <th>Total Amount</th>
                                <th>Payment</th>
                                <th>Order Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-semibold">{order.orderId}</td>
                                    <td>{order.products.map((product) => `${product.productName} x${product.quantity}`).join(', ')}</td>
                                    <td className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(order.totalAmount)}</td>
                                    <td>{order.paymentStatus}</td>
                                    <td>{order.orderStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
