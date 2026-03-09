import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <p className="text-8xl font-display font-black text-gradient">404</p>
            <h1 className="text-2xl font-display font-bold text-white mt-4">Page Not Found</h1>
            <p className="text-slate-400 mt-2 mb-8">The page you're looking for doesn't exist.</p>
            <Link to="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
    );
}
