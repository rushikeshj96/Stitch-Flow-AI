import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { publicBookingService } from '../../services/bookingService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineUser, HiOutlineTag } from 'react-icons/hi';

export default function BookAppointmentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedService, setSelectedService] = useState(searchParams.get('serviceId') || '');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        publicBookingService.getServices()
            .then(res => setServices(res.data.data))
            .catch(() => toast.error('Failed to load services for booking'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                serviceId: selectedService,
                appointmentDate: date,
                appointmentTime: time,
                customerName,
                phoneNumber: phone,
                email,
                notes
            };
            
            await publicBookingService.bookAppointment(payload);
            toast.success('🎉 Appointment Confirmed! We will contact you shortly.');
            navigate('/services'); // redirect to success or services page
            
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    // Time slots mock generator (9 AM to 6 PM)
    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
        "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
    ];

    // Get today's date string for HTML min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="w-full flex-1 bg-neutral-50 dark:bg-neutral-950 py-12 md:py-20 animate-fade-in">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white mb-4">Book an Appointment</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Schedule a fitting or consultation at your convenience. Let us know how we can help.
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-black/5">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* 1. Service Selection */}
                        <section>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs">1</span> 
                                Choose Service
                            </h3>
                            <div className="relative">
                                <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <select 
                                    required 
                                    value={selectedService} 
                                    onChange={e => setSelectedService(e.target.value)}
                                    className="input pl-10"
                                >
                                    <option value="" disabled>Select a tailoring service...</option>
                                    {services.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} (from ₹{s.priceRange.min})</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* 2. Date & Time */}
                        <section>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs">2</span> 
                                Date &amp; Time
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="label text-xs">Date</label>
                                    <div className="relative">
                                        <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input 
                                            type="date" 
                                            required 
                                            min={today}
                                            value={date} 
                                            onChange={e => setDate(e.target.value)} 
                                            className="input pl-10" 
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="label text-xs">Time Slot</label>
                                    <div className="relative">
                                        <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <select 
                                            required 
                                            value={time} 
                                            onChange={e => setTime(e.target.value)}
                                            className="input pl-10"
                                        >
                                            <option value="" disabled>Select Time</option>
                                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Contact Info */}
                        <section>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs">3</span> 
                                Your Details
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input type="text" required placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="input pl-10" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="tel" required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="input" />
                                    <input type="email" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)} className="input" />
                                </div>
                                <textarea 
                                    rows="3" 
                                    placeholder="Any special requests or instructions for the tailor..." 
                                    className="input resize-none"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </section>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <p className="text-xs text-neutral-500 mb-4 text-center">
                                By booking this appointment, you agree to our <Link to="#" className="text-primary-600 hover:underline">Terms of Service</Link>. Payment will be processed in-store after measurement.
                            </p>
                            <button 
                                type="submit" 
                                disabled={submitting || !selectedService || !date || !time || !customerName || !phone}
                                className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary-500/20 flex justify-center"
                            >
                                {submitting ? <LoadingSpinner size="sm" color="text-white" /> : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
