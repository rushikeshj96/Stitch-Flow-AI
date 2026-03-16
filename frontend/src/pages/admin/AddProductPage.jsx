import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import ProductForm from '../../components/products/ProductForm.jsx';
import { productService } from '../../services/productService.js';

export default function AddProductPage() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            await productService.createProduct(formData);
            toast.success('Product added successfully');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error?.message || 'Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    <Link to="/admin/products" className="hover:text-primary-600 dark:hover:text-primary-400">Products</Link> / Add Product
                </p>
                <h1 className="page-title">Add New Product</h1>
                <p className="page-subtitle">Create a new catalog item with image, pricing, and stock details.</p>
            </div>

            <div className="card p-5 sm:p-7">
                <ProductForm
                    onSubmit={handleSubmit}
                    submitting={saving}
                    submitLabel="Create Product"
                />
            </div>
        </div>
    );
}
