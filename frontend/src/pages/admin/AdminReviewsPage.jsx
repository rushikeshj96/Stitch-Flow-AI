import React, { useEffect, useState } from 'react';
import { adminBookingService } from '../../services/bookingService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers.js';
import { HiOutlineStar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTrash } from 'react-icons/hi';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = () => {
        setLoading(true);
        adminBookingService.getReviews()
            .then(res => setReviews(res.data.data))
            .catch(() => toast.error('Failed to load reviews'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await adminBookingService.updateReview(id, { status });
            toast.success(`Review ${status.toLowerCase()}`);
            fetchReviews();
        } catch (err) {
            toast.error('Failed to update review status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
        try {
            await adminBookingService.deleteReview(id);
            toast.success('Review deleted');
            fetchReviews();
        } catch (err) {
            toast.error('Failed to delete review');
        }
    };

    if (loading && reviews.length === 0) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    const pendingCount = reviews.filter(r => r.status === 'Pending').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Review Moderation</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Approve public customer reviews before they appear on your Service Catalog.
                        {pendingCount > 0 && <span className="ml-2 font-bold text-orange-500">[{pendingCount} Pending]</span>}
                    </p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <EmptyState icon="⭐" title="No Reviews Yet" description="When customers leave reviews on your public site, they will appear here for moderation." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(review => (
                        <ReviewCard 
                            key={review._id} 
                            review={review} 
                            onUpdate={handleUpdateStatus} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review, onUpdate, onDelete }) {
    
    const getTheme = (status) => {
        switch(status) {
            case 'Approved': return 'border-green-500 bg-green-500/5';
            case 'Pending': return 'border-orange-500 bg-orange-500/5';
            case 'Rejected': return 'border-red-500 bg-red-500/5';
            default: return 'border-neutral-200';
        }
    };

    return (
        <div className={`card p-5 border-l-4 ${getTheme(review.status)}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-400">
                        {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{review.customerName}</h4>
                        <p className="text-xs text-neutral-500">
                            {formatDate(review.createdAt)} • {review.service?.name || 'Unknown Service'}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${review.status === 'Approved' ? 'bg-green-100 text-green-700' : review.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {review.status}
                </span>
            </div>

            <div className="flex text-yellow-500 mb-3">
                {[...Array(5)].map((_, i) => (
                    <HiOutlineStar key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : ''}`} />
                ))}
            </div>

            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-6 flex-1 italic bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                "{review.message}"
            </p>

            {/* Moderation Actions */}
            <div className="flex items-center gap-2 pt-4 mt-auto border-t border-neutral-100 dark:border-neutral-800">
                {review.status !== 'Approved' && (
                    <button onClick={() => onUpdate(review._id, 'Approved')} className="flex-1 btn-primary py-2 text-xs bg-green-600 hover:bg-green-700 border-none shadow-sm">
                        <HiOutlineCheckCircle className="w-4 h-4 inline mr-1" /> Approve
                    </button>
                )}
                {review.status !== 'Rejected' && (
                    <button onClick={() => onUpdate(review._id, 'Rejected')} className="flex-1 btn-secondary py-2 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                        <HiOutlineXCircle className="w-4 h-4 inline mr-1" /> Reject
                    </button>
                )}
                <button onClick={() => onDelete(review._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto" title="Permanently Delete">
                    <HiOutlineTrash className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
