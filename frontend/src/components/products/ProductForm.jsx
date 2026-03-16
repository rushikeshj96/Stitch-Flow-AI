import React, { useMemo, useState } from 'react';
import { resolveMediaUrl } from '../../utils/media.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PRODUCT_CATEGORIES = [
    'Men Clothing',
    'Women Clothing',
    'Wedding Wear',
    'Casual Wear',
    'Accessories',
];

const getInitialState = (initialValues = {}) => ({
    productName: initialValues.name || '',
    productDescription: initialValues.description || '',
    price: initialValues.price ?? '',
    discountPrice: initialValues.discountPrice ?? '',
    category: initialValues.category || PRODUCT_CATEGORIES[0],
    stockQuantity: initialValues.stockQuantity ?? 0,
    sizes: Array.isArray(initialValues.sizes) ? initialValues.sizes.join(', ') : '',
});

export default function ProductForm({ initialValues, onSubmit, submitting = false, submitLabel = 'Save Product' }) {
    const [formData, setFormData] = useState(() => getInitialState(initialValues));
    const [imageFiles, setImageFiles] = useState([]);
    const [imageError, setImageError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const existingImages = useMemo(
        () => (initialValues?.imageUrls || []).map((url) => resolveMediaUrl(url)).filter(Boolean),
        [initialValues?.imageUrls]
    );

    const previewUrls = useMemo(() => {
        if (imageFiles.length > 0) {
            return imageFiles.map((file) => URL.createObjectURL(file));
        }
        return existingImages;
    }, [imageFiles, existingImages]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) {
            setImageFiles([]);
            setImageError('');
            return;
        }

        const hasInvalidType = files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
        if (hasInvalidType) {
            setImageError('Only JPG, PNG, and WEBP formats are supported.');
            setImageFiles([]);
            return;
        }

        const hasOversize = files.some((file) => file.size > MAX_IMAGE_SIZE_BYTES);
        if (hasOversize) {
            setImageError('Each image must be 5MB or smaller.');
            setImageFiles([]);
            return;
        }

        setImageError('');
        setImageFiles(files);
    };

    const validate = () => {
        const errors = {};
        if (!formData.productName.trim()) errors.productName = 'Product name is required.';
        if (!formData.productDescription.trim()) errors.productDescription = 'Description is required.';
        if (formData.price === '' || Number(formData.price) < 0) errors.price = 'Enter a valid price.';
        if (formData.discountPrice !== '' && Number(formData.discountPrice) < 0) errors.discountPrice = 'Discount price cannot be negative.';
        if (formData.discountPrice !== '' && Number(formData.discountPrice) > Number(formData.price)) errors.discountPrice = 'Discount price must be lower than regular price.';
        if (!formData.category) errors.category = 'Select a category.';
        if (formData.stockQuantity === '' || Number(formData.stockQuantity) < 0) errors.stockQuantity = 'Enter valid stock quantity.';
        if (imageFiles.length === 0 && existingImages.length === 0) errors.productImages = 'At least one product image is required.';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0 && !imageError;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        const payload = new FormData();
        payload.append('productName', formData.productName.trim());
        payload.append('productDescription', formData.productDescription.trim());
        payload.append('price', formData.price);
        if (formData.discountPrice !== '') payload.append('discountPrice', formData.discountPrice);
        payload.append('category', formData.category);
        payload.append('stockQuantity', formData.stockQuantity);

        const sizes = formData.sizes
            .split(',')
            .map((size) => size.trim())
            .filter(Boolean);
        payload.append('sizes', JSON.stringify(sizes));

        imageFiles.forEach((file) => payload.append('productImages', file));

        await onSubmit(payload);
    };

    React.useEffect(() => () => {
        previewUrls.forEach((url) => {
            if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
    }, [previewUrls]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="label">Product Name *</label>
                    <input name="productName" value={formData.productName} onChange={handleChange} className={validationErrors.productName ? 'input-error' : 'input'} />
                    {validationErrors.productName ? <p className="error-msg">{validationErrors.productName}</p> : null}
                </div>
                <div>
                    <label className="label">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className={validationErrors.category ? 'input-error' : 'input'}>
                        {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    {validationErrors.category ? <p className="error-msg">{validationErrors.category}</p> : null}
                </div>
            </div>

            <div>
                <label className="label">Description *</label>
                <textarea name="productDescription" rows={5} value={formData.productDescription} onChange={handleChange} className={validationErrors.productDescription ? 'input-error resize-none' : 'input resize-none'} />
                {validationErrors.productDescription ? <p className="error-msg">{validationErrors.productDescription}</p> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                    <label className="label">Price (INR) *</label>
                    <input type="number" min="0" step="1" name="price" value={formData.price} onChange={handleChange} className={validationErrors.price ? 'input-error' : 'input'} />
                    {validationErrors.price ? <p className="error-msg">{validationErrors.price}</p> : null}
                </div>
                <div>
                    <label className="label">Discount Price</label>
                    <input type="number" min="0" step="1" name="discountPrice" value={formData.discountPrice} onChange={handleChange} className={validationErrors.discountPrice ? 'input-error' : 'input'} />
                    {validationErrors.discountPrice ? <p className="error-msg">{validationErrors.discountPrice}</p> : null}
                </div>
                <div>
                    <label className="label">Stock Quantity *</label>
                    <input type="number" min="0" step="1" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className={validationErrors.stockQuantity ? 'input-error' : 'input'} />
                    {validationErrors.stockQuantity ? <p className="error-msg">{validationErrors.stockQuantity}</p> : null}
                </div>
                <div>
                    <label className="label">Sizes</label>
                    <input name="sizes" value={formData.sizes} onChange={handleChange} className="input" placeholder="S, M, L, XL" />
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="label">Product Images (JPG, PNG, WEBP | max 5MB each) *</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleImageChange}
                        className={validationErrors.productImages || imageError ? 'input-error file:mr-4 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700' : 'input file:mr-4 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700'} />
                    {validationErrors.productImages ? <p className="error-msg">{validationErrors.productImages}</p> : null}
                    {imageError ? <p className="error-msg">{imageError}</p> : null}
                </div>

                {previewUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {previewUrls.map((url, index) => (
                            <img key={`${url}-${index}`} src={url} alt={`Product preview ${index + 1}`} className="w-full h-32 rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover" />
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="flex items-center justify-end">
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
            </div>
        </form>
    );
}
