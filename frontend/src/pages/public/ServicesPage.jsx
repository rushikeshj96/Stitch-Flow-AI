import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicBookingService } from '../../services/bookingService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { HiOutlineArrowRight } from 'react-icons/hi';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        publicBookingService.getServices()
            .then(res => setServices(res.data.data))
            .catch(err => console.error("Failed to fetch public services:", err))
            .finally(() => setLoading(false));
    }, []);

    const categories = ['All', ...new Set(services.map(s => s.category))];
    const filtered = filter === 'All' ? services : services.filter(s => s.category === filter);

    if (loading) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="w-full flex-1 bg-neutral-50 dark:bg-neutral-950 py-16 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Sequence */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white mb-6">Our Tailoring Services</h1>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                        Explore our premium catalog of custom tailoring, alterations, and design consultations crafted just for you.
                    </p>
                </div>

                {/* Filter Pills */}
                {categories.length > 2 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                                    filter === cat 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {filtered.length === 0 ? (
                    <EmptyState 
                        title="No services found" 
                        description={`We couldn't find any active services under the "${filter}" category.`} 
                        icon="🪡" 
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(service => (
                            <ServicePublicCard key={service._id} service={service} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ServicePublicCard({ service }) {
    // Show placeholder if no image exists
    const imageUrl = service.images?.[0] || 'https://images.unsplash.com/photo-1598522325824-3c8731910603?auto=format&fit=crop&q=80&w=800';

    return (
        <div className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all flex flex-col">
            <div className="relative h-56 overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-800 dark:text-neutral-200 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        {service.category}
                    </span>
                </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 font-display">{service.name}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-2 mb-6 flex-1">
                    {service.description}
                </p>
                
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-1">Starting At</p>
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            ₹{service.priceRange?.min}
                        </p>
                    </div>
                    <Link 
                        to={`/services/${service._id}`} 
                        className="flex items-center gap-1 text-sm font-semibold text-neutral-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400 transition-colors"
                    >
                        View Details <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
