import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCart } from '../../context/CartContext.jsx';
import { formatCurrency } from '../../utils/helpers.js';
import { storeService } from '../../services/storeService.js';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, summary, clearCart } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        customerName: '',
        phoneNumber: '',
        email: '',
        shippingAddress: '',
        paymentProvider: 'Razorpay',
    });

    const cartPayload = useMemo(
        () => items.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size })),
        [items]
    );

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">No items in cart</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-3">Add products before checkout.</p>
            </div>
        );
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const paymentInit = await storeService.initializePayment({
                amount: summary.totalAmount,
                provider: form.paymentProvider,
                metadata: { customerEmail: form.email },
            });

            const paymentReference = paymentInit.data?.data?.id || '';

            const response = await storeService.placeOrder({
                ...form,
                products: cartPayload,
                paymentStatus: 'Paid',
                paymentReference,
            });

            const order = response.data?.data?.order;
            if (order?.orderId) {
                localStorage.setItem('sf_store_last_order_contact', JSON.stringify({ email: form.email, phoneNumber: form.phoneNumber }));
            }

            clearCart();
            toast.success('Order placed successfully');
            navigate('/my-orders');
        } catch (error) {
            toast.error(error?.message || 'Checkout failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <form onSubmit={handleSubmit} className="lg:col-span-2 card p-6 space-y-4">
                <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">Checkout</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required name="customerName" value={form.customerName} onChange={handleChange} className="input" placeholder="Full Name" />
                    <input required name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input" placeholder="Phone Number" />
                    <input required type="email" name="email" value={form.email} onChange={handleChange} className="input md:col-span-2" placeholder="Email" />
                    <textarea required name="shippingAddress" value={form.shippingAddress} onChange={handleChange} rows={4} className="input resize-none md:col-span-2" placeholder="Shipping Address" />
                    <select name="paymentProvider" value={form.paymentProvider} onChange={handleChange} className="input md:col-span-2">
                        <option value="Razorpay">Razorpay</option>
                        <option value="Stripe">Stripe</option>
                    </select>
                </div>
                <button className="btn-primary" disabled={submitting}>{submitting ? 'Processing...' : 'Pay & Place Order'}</button>
            </form>

            <div className="card p-5 h-fit space-y-4">
                <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">Order Summary</h2>
                <div className="space-y-3 text-sm">
                    {items.map((item) => (
                        <div key={item.key} className="flex justify-between gap-3">
                            <span className="text-neutral-600 dark:text-neutral-300">{item.productName} x {item.quantity}</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{formatCurrency((typeof item.discountPrice === 'number' ? item.discountPrice : item.price) * item.quantity)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(summary.discount)}</span></div>
                    <div className="flex justify-between font-semibold text-neutral-900 dark:text-white"><span>Total</span><span>{formatCurrency(summary.totalAmount)}</span></div>
                </div>
            </div>
        </div>
    );
}
