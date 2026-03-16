import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'sf_store_cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = (product, quantity = 1, size = '') => {
        if (!product?._id) return;
        if (product.stockQuantity <= 0) {
            toast.error('This product is out of stock');
            return;
        }

        const key = `${product._id}__${size || 'nosize'}`;
        setItems((prev) => {
            const existing = prev.find((item) => item.key === key);
            if (existing) {
                const nextQty = Math.min(existing.quantity + quantity, product.stockQuantity);
                const effectivePrice = typeof existing.discountPrice === 'number' ? existing.discountPrice : existing.price;
                return prev.map((item) => item.key === key ? { ...item, quantity: nextQty, totalPrice: effectivePrice * nextQty } : item);
            }

            const effectivePrice = typeof product.discountPrice === 'number' ? product.discountPrice : product.price;
            return [
                ...prev,
                {
                    key,
                    productId: product._id,
                    productName: product.name,
                    imageUrl: product.imageUrls?.[0] || product.imageUrl || '',
                    price: product.price,
                    discountPrice: product.discountPrice,
                    size,
                    quantity: Math.min(quantity, product.stockQuantity),
                    totalPrice: effectivePrice * Math.min(quantity, product.stockQuantity),
                    stockQuantity: product.stockQuantity,
                },
            ];
        });

        toast.success('Added to cart');
    };

    const updateQuantity = (key, quantity) => {
        const qty = Number(quantity);
        if (qty <= 0) {
            setItems((prev) => prev.filter((item) => item.key !== key));
            return;
        }

        setItems((prev) => prev.map((item) => {
            if (item.key !== key) return item;
            const nextQty = Math.min(qty, item.stockQuantity);
            const effectivePrice = typeof item.discountPrice === 'number' ? item.discountPrice : item.price;
            return { ...item, quantity: nextQty, totalPrice: effectivePrice * nextQty };
        }));
    };

    const removeFromCart = (key) => {
        setItems((prev) => prev.filter((item) => item.key !== key));
    };

    const clearCart = () => setItems([]);

    const summary = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = items.reduce((sum, item) => {
            const discountPrice = typeof item.discountPrice === 'number' ? item.discountPrice : item.price;
            return sum + ((item.price - discountPrice) * item.quantity);
        }, 0);
        const totalAmount = Math.max(0, subtotal - discount);

        return {
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            discount,
            totalAmount,
        };
    }, [items]);

    return (
        <CartContext.Provider value={{
            items,
            summary,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within <CartProvider>');
    return ctx;
}
