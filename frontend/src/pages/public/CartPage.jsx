import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineTrash } from 'react-icons/hi';

import { useCart } from '../../context/CartContext.jsx';
import { formatCurrency } from '../../utils/helpers.js';
import { resolveMediaUrl } from '../../utils/media.js';

export default function CartPage() {
    const navigate = useNavigate();
    const { items, summary, updateQuantity, removeFromCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">Your cart is empty</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-3">Add products from the catalog to continue.</p>
                <Link to="/products" className="btn-primary mt-6">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card divide-y divide-neutral-200 dark:divide-neutral-800">
                    {items.map((item) => (
                        <div key={item.key} className="p-4 sm:p-5 flex gap-4">
                            <img src={resolveMediaUrl(item.imageUrl)} alt={item.productName} className="w-20 h-20 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800" />
                            <div className="flex-1">
                                <p className="font-semibold text-neutral-900 dark:text-white">{item.productName}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Size: {item.size || 'N/A'}</p>
                                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">{formatCurrency(typeof item.discountPrice === 'number' ? item.discountPrice : item.price)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={item.stockQuantity}
                                    className="input w-20"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.key, e.target.value)}
                                />
                                <button className="btn-ghost p-1.5 text-red-600" onClick={() => removeFromCart(item.key)}>
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card p-5 h-fit space-y-4">
                    <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">Cart Summary</h2>
                    <div className="text-sm space-y-2 text-neutral-600 dark:text-neutral-300">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(summary.discount)}</span></div>
                        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex justify-between font-semibold text-neutral-900 dark:text-white">
                            <span>Total Amount</span><span>{formatCurrency(summary.totalAmount)}</span>
                        </div>
                    </div>
                    <button className="btn-primary w-full" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
}
