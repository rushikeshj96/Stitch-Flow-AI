import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicBookingService } from '../../services/bookingService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineCheckCircle, HiOutlineStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review Form State
    const [revName, setRevName] = useState('');
    const [revRating, setRevRating] = useState(5);
    const [revMsg, setRevMsg] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        publicBookingService.getServiceById(id)
            .then(res => setData(res.data.data))
            .catch(err => {
                toast.error(err.response?.data?.message || 'Service not found');
                navigate('/services');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading || !data) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    const { service, reviews } = data;
    const imageUrl = service.images?.[0] || 'https://images.unsplash.com/photo-1598522325824-3c8731910603?auto=format&fit=crop&q=80&w=1200';

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await publicBookingService.submitReview({
                serviceId: service._id,
                customerName: revName,
                rating: revRating,
                message: revMsg
            });
            toast.success('Review submitted! It will appear once approved.');
            setRevName('');
            setRevMsg('');
            setRevRating(5);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="w-full flex-1 bg-white dark:bg-neutral-950 animate-fade-in pb-20">
            {/* Header / Hero */}
            <div className="relative h-[400px] w-full bg-neutral-900 border-b border-neutral-800">
                <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
                    <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                        {service.category}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2">{service.name}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-4">About this Service</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                            {service.description}
                        </p>
                    </section>

                    {/* Quick Stats */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                            <HiOutlineClock className="w-8 h-8 text-primary-500 mb-3" />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Estimated Time</p>
                            <p className="font-bold text-neutral-900 dark:text-white">{service.estimatedTime}</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                            <HiOutlineCurrencyRupee className="w-8 h-8 text-primary-500 mb-3" />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Price Range</p>
                            <p className="font-bold text-neutral-900 dark:text-white">₹{service.priceRange.min} {service.priceRange.max ? `- ₹${service.priceRange.max}` : '+'}</p>
                        </div>
                    </section>

                    {/* Process Steps */}
                    {service.processSteps?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-6">How it Works</h2>
                            <div className="space-y-6">
                                {service.processSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900 dark:text-white mb-1">{step.title}</h4>
                                            <p className="text-neutral-600 dark:text-neutral-400">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* FAQs */}
                    {service.faqs?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {service.faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                        <h4 className="font-bold text-neutral-900 dark:text-white mb-2">{faq.question}</h4>
                                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    
                    <hr className="border-neutral-200 dark:border-neutral-800" />
                    
                    {/* Public Reviews */}
                    <section>
                        <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-6">Customer Reviews</h2>
                        
                        {reviews.length === 0 ? (
                            <p className="text-neutral-500 italic mb-8">No reviews yet. Be the first to review this service!</p>
                        ) : (
                            <div className="space-y-4 mb-10">
                                {reviews.map(r => (
                                    <div key={r._id} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <HiOutlineStar key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : ''}`} />
                                                ))}
                                            </div>
                                            <span className="font-bold text-sm text-neutral-900 dark:text-white">{r.customerName}</span>
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">{r.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Review Form */}
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                            <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Leave a Review</h4>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="text" placeholder="Your Name" value={revName} onChange={e => setRevName(e.target.value)} className="input" />
                                    <select value={revRating} onChange={e => setRevRating(Number(e.target.value))} className="input">
                                        <option value={5}>5 Stars - Excellent</option>
                                        <option value={4}>4 Stars - Great</option>
                                        <option value={3}>3 Stars - Average</option>
                                        <option value={2}>2 Stars - Poor</option>
                                        <option value={1}>1 Star - Terrible</option>
                                    </select>
                                </div>
                                <textarea required rows={3} placeholder="How was your experience?" value={revMsg} onChange={e => setRevMsg(e.target.value)} className="input resize-none" />
                                <button type="submit" disabled={submittingReview} className="btn-secondary w-full">
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>

                {/* Sidebar Sticky Booking Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl shadow-black/5 p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Book this Service</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">Schedule an appointment with our master tailors.</p>
                        
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <HiOutlineCheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                                Free initial consultation
                            </li>
                            <li className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <HiOutlineCheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                                Exact body measurements
                            </li>
                            <li className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <HiOutlineCheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                                Fabric & styling advice
                            </li>
                        </ul>

                        <Link 
                            to={`/book-appointment?serviceId=${service._id}`} 
                            className="btn-primary w-full block text-center py-4 text-base shadow-lg shadow-primary-500/20"
                        >
                            Select Date &amp; Time
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
