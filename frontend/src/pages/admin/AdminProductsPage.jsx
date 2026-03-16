import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePencilAlt, HiOutlinePlus, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';

import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { productService } from '../../services/productService.js';
import { formatCurrency, truncate } from '../../utils/helpers.js';
import { resolveMediaUrl } from '../../utils/media.js';

export default function AdminProductsPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts();
            setProducts(response.data.data || []);
        } catch (error) {
            toast.error(error?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product from the catalog?')) return;
        setDeletingId(id);
        try {
            await productService.deleteProduct(id);
            toast.success('Product deleted');
            setProducts((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            toast.error(error?.message || 'Failed to delete product');
        } finally {
            setDeletingId('');
        }
    };

    if (loading && products.length === 0) {
        return <div className="py-24 flex justify-center"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="section-header">
                <div>
                    <h1 className="page-title">Product Catalog</h1>
                    <p className="page-subtitle">Manage products shown on your public website.</p>
                </div>
                <Link to="/admin/products/new" className="btn-primary">
                    <HiOutlinePlus className="w-5 h-5" /> Add Product
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="card px-6 py-14 text-center">
                    <p className="text-5xl mb-3">🧵</p>
                    <h2 className="text-xl font-display font-semibold text-neutral-900 dark:text-white">No products yet</h2>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">Create your first product to start showcasing your catalog publicly.</p>
                    <button type="button" className="btn-primary mt-6" onClick={() => navigate('/admin/products/new')}>
                        Create Product
                    </button>
                </div>
            ) : (
                <div className="table-wrapper bg-white dark:bg-neutral-900">
                    <table className="table min-w-[980px]">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Description</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="flex items-center gap-3 min-w-[220px]">
                                            <img
                                                src={resolveMediaUrl(product.imageUrls?.[0] || product.imageUrl)}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800"
                                            />
                                            <div>
                                                <p className="font-semibold text-neutral-900 dark:text-white">{product.name}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(product.createdAt).toLocaleDateString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td className="font-semibold text-primary-600 dark:text-primary-400">
                                        {formatCurrency(typeof product.discountPrice === 'number' ? product.discountPrice : product.price)}
                                        {typeof product.discountPrice === 'number' ? <span className="ml-2 text-xs line-through text-neutral-400">{formatCurrency(product.price)}</span> : null}
                                    </td>
                                    <td>
                                        <span className={product.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}>
                                            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                        </span>
                                    </td>
                                    <td className="max-w-sm">{truncate(product.description, 90)}</td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/products/${product._id}`} className="btn-ghost p-2" title="View product">
                                                <HiOutlineEye className="w-5 h-5" />
                                            </Link>
                                            <Link to={`/admin/products/${product._id}/edit`} className="btn-ghost p-2" title="Edit product">
                                                <HiOutlinePencilAlt className="w-5 h-5" />
                                            </Link>
                                            <button
                                                className="btn-ghost p-2 text-red-600 hover:text-red-700"
                                                onClick={() => handleDelete(product._id)}
                                                disabled={deletingId === product._id}
                                                title="Delete product"
                                            >
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>
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
