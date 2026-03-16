import React, { useEffect, useState } from 'react';
import { adminBookingService } from '../../services/bookingService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers.js';
import { HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchAppointments = () => {
        setLoading(true);
        // We'll fetch all and filter client side for speed, but can move to query params
        adminBookingService.getAppointments()
            .then(res => setAppointments(res.data.data))
            .catch(() => toast.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAppointments(); }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await adminBookingService.updateAppointment(id, { status: newStatus });
            toast.success(`Appointment marked as ${newStatus}`);
            fetchAppointments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
        try {
            await adminBookingService.deleteAppointment(id);
            toast.success('Appointment deleted');
            fetchAppointments();
        } catch (err) {
            toast.error('Failed to delete appointment');
        }
    };

    const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Appointment Bookings</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage public fitting and consultation requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                            filter === f 
                            ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900' 
                            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading && appointments.length === 0 ? (
                <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>
            ) : filtered.length === 0 ? (
                <EmptyState icon="📆" title={`No ${filter} Appointments`} description="You have no appointments matching this status." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(appt => (
                        <AppointmentCard 
                            key={appt._id} 
                            appt={appt} 
                            onUpdate={handleStatusUpdate} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function AppointmentCard({ appt, onUpdate, onDelete }) {
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500';
            case 'Confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
            case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
            case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
            default: return 'bg-neutral-100 text-neutral-700';
        }
    };

    return (
        <div className="card p-5 border-l-4" style={{ borderLeftColor: appt.status === 'Pending' ? '#EAB308' : appt.status === 'Confirmed' ? '#3B82F6' : appt.status === 'Completed' ? '#22C55E' : '#EF4444' }}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-lg">{appt.customerName}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                        <HiOutlineCalendar className="w-4 h-4" /> {formatDate(appt.appointmentDate)} at {appt.appointmentTime}
                    </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                    {appt.status}
                </span>
            </div>

            <div className="space-y-2 mb-6">
                <div className="bg-neutral-50 dark:bg-white/5 rounded-lg p-3 text-sm">
                    <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Service Requested</p>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">{appt.service?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-100 dark:border-neutral-800 rounded-lg p-3">
                    <p>Phone: <span className="text-neutral-900 dark:text-white font-medium">{appt.phoneNumber}</span></p>
                    <p className="truncate">Email: {appt.email || 'N/A'}</p>
                </div>
                {appt.notes && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 italic bg-neutral-50 dark:bg-neutral-900 p-2 rounded">
                        " {appt.notes} "
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                {appt.status === 'Pending' && (
                    <>
                        <button onClick={() => onUpdate(appt._id, 'Confirmed')} className="flex-1 btn-primary py-2 text-sm bg-blue-600 hover:bg-blue-700 border-none">
                            <HiOutlineCheckCircle className="w-4 h-4 inline mr-1" /> Confirm
                        </button>
                        <button onClick={() => onUpdate(appt._id, 'Cancelled')} className="flex-1 btn-secondary py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                            Reject
                        </button>
                    </>
                )}
                {appt.status === 'Confirmed' && (
                    <button onClick={() => onUpdate(appt._id, 'Completed')} className="flex-1 btn-primary py-2 text-sm bg-green-600 hover:bg-green-700 border-none">
                        Mark Completed
                    </button>
                )}
                {(appt.status === 'Completed' || appt.status === 'Cancelled') && (
                    <button onClick={() => onDelete(appt._id)} className="flex-1 btn-secondary py-2 text-sm hover:text-red-600 transition-colors">
                        <HiOutlineXCircle className="w-4 h-4 inline mr-1" /> Delete Record
                    </button>
                )}
            </div>
        </div>
    );
}
