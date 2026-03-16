import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineShoppingCart } from 'react-icons/hi';

import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { productService } from '../../services/productService.js';
import { formatCurrency } from '../../utils/helpers.js';
import { resolveMediaUrl } from '../../utils/media.js';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const response = await productService.getProductById(id);
                const data = response.data.data || null;
                setProduct(data);
                if (data) {
                    setActiveImage(data.imageUrls?.[0] || data.imageUrl || '');
                    setSelectedSize(data.sizes?.[0] || '');
                }
            } catch (error) {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    if (loading) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    if (!product) {
        return (
            <div className="py-24 px-4 text-center">
                <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">Product not found</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2">The requested product may have been removed.</p>
                <Link to="/products" className="btn-primary mt-6">Back to Products</Link>
            </div>
        );
    }

    const gallery = product.imageUrls?.length ? product.imageUrls : [product.imageUrl];
    const effectivePrice = typeof product.discountPrice === 'number' ? product.discountPrice : product.price;

    return (
        <div className="w-full flex-1 py-12 bg-neutral-50 dark:bg-neutral-950 animate-fade-in">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Products
                </Link>

                <div className="rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-4 sm:p-6 space-y-3">
                            <div className="h-[320px] sm:h-[420px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
                                <img src={resolveMediaUrl(activeImage)} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {gallery.map((image) => (
                                    <button key={image} onClick={() => setActiveImage(image)} className={`rounded-xl overflow-hidden border ${activeImage === image ? 'border-primary-500' : 'border-neutral-200 dark:border-neutral-700'}`}>
                                        <img src={resolveMediaUrl(image)} alt="Product thumb" className="w-full h-20 object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-primary-600 dark:text-primary-400">{product.category}</p>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-white mt-2">{product.name}</h1>
                                <div className="flex items-center gap-3 mt-4">
                                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(effectivePrice)}</p>
                                    {typeof product.discountPrice === 'number' ? <p className="text-lg line-through text-neutral-400">{formatCurrency(product.price)}</p> : null}
                                </div>
                            </div>

                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">{product.description}</p>

                            {product.sizes?.length ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Available Sizes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={selectedSize === size ? 'px-3 py-1.5 rounded-lg text-sm bg-primary-600 text-white' : 'px-3 py-1.5 rounded-lg text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
                                <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Stock Status</p>
                                <p className={product.stockQuantity > 0 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-red-600 dark:text-red-400'}>
                                    {product.stockQuantity > 0 ? `${product.stockQuantity} items available` : 'Out of stock'}
                                </p>
                            </div>

                            <button
                                className="btn-primary w-full"
                                onClick={() => addToCart(product, 1, selectedSize)}
                                disabled={product.stockQuantity <= 0}
                            >
                                <HiOutlineShoppingCart className="w-5 h-5" /> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
