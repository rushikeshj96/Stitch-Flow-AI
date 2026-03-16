import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ProductForm from '../../components/products/ProductForm.jsx';
import { productService } from '../../services/productService.js';

export default function EditProductPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const response = await productService.getProductById(id);
                setProduct(response.data.data);
            } catch (error) {
                toast.error(error?.message || 'Product not found');
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id, navigate]);

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            await productService.updateProduct(id, formData);
            toast.success('Product updated successfully');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="py-24 flex justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (!product) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    <Link to="/admin/products" className="hover:text-primary-600 dark:hover:text-primary-400">Products</Link> / Edit Product
                </p>
                <h1 className="page-title">Edit Product</h1>
                <p className="page-subtitle">Update details and image for this catalog item.</p>
            </div>

            <div className="card p-5 sm:p-7">
                <ProductForm
                    initialValues={product}
                    onSubmit={handleSubmit}
                    submitting={saving}
                    submitLabel="Update Product"
                />
            </div>
        </div>
    );
}
