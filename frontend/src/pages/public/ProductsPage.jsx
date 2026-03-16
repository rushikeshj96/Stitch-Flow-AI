import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineEye, HiOutlineShoppingCart, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';

import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import { productService } from '../../services/productService.js';
import { formatCurrency, truncate } from '../../utils/helpers.js';
import { resolveMediaUrl } from '../../utils/media.js';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductsPage() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ category: 'All', minPrice: '', maxPrice: '', size: '', availability: '', sortBy: 'newest' });
    const [quickView, setQuickView] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const filterPanelRef = useRef(null);
    const filterButtonRef = useRef(null);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    ...(search ? { search } : {}),
                    ...(filters.category !== 'All' ? { category: filters.category } : {}),
                    ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
                    ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
                    ...(filters.size ? { size: filters.size } : {}),
                    ...(filters.availability ? { availability: filters.availability } : {}),
                };

                const response = await productService.getProducts(params);
                setProducts(response.data.data || []);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(loadProducts, 250);
        return () => clearTimeout(timeout);
    }, [search, filters]);

    const categories = useMemo(() => ['All', 'Men Clothing', 'Women Clothing', 'Wedding Wear', 'Casual Wear', 'Accessories'], []);
    const sizes = useMemo(() => {
        const allSizes = products.flatMap((item) => item.sizes || []);
        return Array.from(new Set(allSizes)).sort();
    }, [products]);

    const activeFiltersCount = useMemo(
        () => Object.entries(filters).filter(([key, value]) => key !== 'sortBy' && key !== 'category' ? Boolean(value) : value && value !== 'All').length,
        [filters]
    );

    const sortedProducts = useMemo(() => {
        const cloned = [...products];
        if (filters.sortBy === 'price-low-high') {
            return cloned.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        }
        if (filters.sortBy === 'price-high-low') {
            return cloned.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        }
        return cloned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [products, filters.sortBy]);

    useEffect(() => {
        if (!showFilters) return undefined;

        const handleClickOutside = (event) => {
            const clickedInsidePanel = filterPanelRef.current?.contains(event.target);
            const clickedFilterBtn = filterButtonRef.current?.contains(event.target);

            if (!clickedInsidePanel && !clickedFilterBtn) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    const resetFilters = () => {
        setFilters({ category: 'All', minPrice: '', maxPrice: '', size: '', availability: '', sortBy: 'newest' });
    };

    const panelContent = (
        <>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Filter Products</h3>
                <button className="btn-ghost p-1.5" onClick={() => setShowFilters(false)}>
                    <HiOutlineX className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3 pt-2">
                <div>
                    <label className="label">Category</label>
                    <select className="input" value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                </div>

                <div>
                    <label className="label">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" min="0" className="input" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))} />
                        <input type="number" min="0" className="input" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))} />
                    </div>
                </div>

                <div>
                    <label className="label">Size</label>
                    <select className="input" value={filters.size} onChange={(e) => setFilters((p) => ({ ...p, size: e.target.value }))}>
                        <option value="">All Sizes</option>
                        {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>

                <div>
                    <label className="label">Availability</label>
                    <select className="input" value={filters.availability} onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))}>
                        <option value="">All Availability</option>
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>
                </div>

                <div>
                    <label className="label">Sort By</label>
                    <select className="input" value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}>
                        <option value="newest">Newest</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                    </select>
                </div>

                <button className="btn-secondary w-full" onClick={resetFilters}>Reset Filters</button>
            </div>
        </>
    );

    if (loading) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="w-full flex-1 py-12 bg-neutral-50 dark:bg-neutral-950 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white">Online Store</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-3">Browse, filter, and purchase boutique-ready products.</p>
                </div>

                <div className="relative">
                    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
                        <input className="input flex-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product name" />
                        <button
                            ref={filterButtonRef}
                            className="btn-secondary shrink-0"
                            onClick={() => setShowFilters((prev) => !prev)}
                        >
                            <HiOutlineFilter className="w-4 h-4" />
                            Filters
                            {activeFiltersCount > 0 ? <span className="badge-primary">{activeFiltersCount}</span> : null}
                        </button>
                    </div>

                    {showFilters ? (
                        <div ref={filterPanelRef} className="hidden md:block absolute right-0 top-[calc(100%+0.5rem)] w-full max-w-sm card p-4 z-20 animate-slide-up">
                            {panelContent}
                        </div>
                    ) : null}
                </div>

                {showFilters ? (
                    <div className="md:hidden fixed inset-0 z-40">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowFilters(false)} />
                        <div ref={filterPanelRef} className="absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-4 animate-slide-in overflow-y-auto">
                            {panelContent}
                        </div>
                    </div>
                ) : null}

                {sortedProducts.length === 0 ? (
                    <div className="card px-6 py-16 text-center">
                        <h2 className="text-xl font-display font-semibold text-neutral-900 dark:text-white">No matching products found</h2>
                        <p className="mt-2 text-neutral-500 dark:text-neutral-400">Try changing your search text or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sortedProducts.map((product) => {
                            const effectivePrice = typeof product.discountPrice === 'number' ? product.discountPrice : product.price;
                            return (
                                <article key={product._id} className="group rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                                    <Link to={`/products/${product._id}`} className="h-56 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                        <img src={resolveMediaUrl(product.imageUrls?.[0] || product.imageUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </Link>
                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{product.category}</p>
                                        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">{product.name}</h2>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{truncate(product.description, 80)}</p>
                                        <div className="mt-auto">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(effectivePrice)}</span>
                                                {typeof product.discountPrice === 'number' ? <span className="text-sm line-through text-neutral-400">{formatCurrency(product.price)}</span> : null}
                                            </div>
                                            <p className={product.stockQuantity > 0 ? 'text-xs text-emerald-600 dark:text-emerald-400' : 'text-xs text-red-600 dark:text-red-400'}>
                                                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <button className="btn-secondary px-3 py-2" onClick={() => setQuickView(product)}><HiOutlineEye className="w-4 h-4" /> Quick View</button>
                                            <button className="btn-primary px-3 py-2" onClick={() => addToCart(product, 1, product.sizes?.[0] || '')} disabled={product.stockQuantity <= 0}>
                                                <HiOutlineShoppingCart className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal isOpen={!!quickView} onClose={() => setQuickView(null)} title={quickView?.name || 'Quick View'} size="lg">
                {quickView ? (
                    <div className="space-y-4">
                        <img src={resolveMediaUrl(quickView.imageUrls?.[0] || quickView.imageUrl)} alt={quickView.name} className="w-full h-72 object-cover rounded-2xl border border-neutral-200 dark:border-neutral-800" />
                        <p className="text-neutral-600 dark:text-neutral-300">{quickView.description}</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider">Price</p>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(typeof quickView.discountPrice === 'number' ? quickView.discountPrice : quickView.price)}</p>
                            </div>
                            <button className="btn-primary" onClick={() => { addToCart(quickView, 1, quickView.sizes?.[0] || ''); setQuickView(null); }} disabled={quickView.stockQuantity <= 0}>
                                <HiOutlineShoppingCart className="w-4 h-4" /> Add to Cart
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
