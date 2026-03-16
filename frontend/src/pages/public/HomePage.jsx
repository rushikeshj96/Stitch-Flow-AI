import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineScissors, HiOutlineSparkles, HiOutlineClock, HiOutlineChatAlt2 } from 'react-icons/hi';

export default function HomePage() {
    return (
        <div className="w-full flex-1 animate-fade-in bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <section className="relative w-full h-[600px] flex items-center overflow-hidden bg-neutral-900 border-b border-neutral-800">
                {/* Background image / overlay */}
                <div 
                    className="absolute inset-0 opacity-40 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=2070')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
                    <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full text-sm font-medium mb-6 inline-block">
                        Precision &amp; Perfection
                    </span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 max-w-3xl">
                        Bespoke Tailoring,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                            Crafted for You.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-10">
                        Experience world-class tailoring from the comfort of your home. Browse our exclusive services, track your order, and book an appointment online in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/book-appointment" className="bg-primary-600 hover:bg-primary-500 text-white font-semibold py-4 px-8 rounded-xl shadow-xl shadow-primary-600/30 transition-all text-center">
                            Book an Appointment
                        </Link>
                        <Link to="/services" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all text-center">
                            Explore Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us features */}
            <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-4">Why Choose StitchFlow?</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                            We bridge traditional craftsmanship with modern convenience.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<HiOutlineScissors className="w-8 h-8" />}
                            title="Master Tailors"
                            description="Our team consists of industry veterans with decades of experience creating custom fits."
                        />
                        <FeatureCard 
                            icon={<HiOutlineSparkles className="w-8 h-8" />}
                            title="AI Styling"
                            description="Not sure what fits? Use our integrated AI to get personalized fashion and fabric suggestions."
                        />
                        <FeatureCard 
                            icon={<HiOutlineClock className="w-8 h-8" />}
                            title="On-Time Delivery"
                            description="We transparently share timelines so your outfit is always ready for the big day."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-8 hover:-translate-y-1 transition-transform shadow-lg shadow-black/5">
            <div className="w-14 h-14 bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{title}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
