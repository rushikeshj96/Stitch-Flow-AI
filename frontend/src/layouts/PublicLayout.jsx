import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HiOutlineScissors, HiOutlineMenuAlt3, HiOutlineX, HiOutlineShoppingCart } from 'react-icons/hi';
import { useCart } from '../context/CartContext.jsx';

export default function PublicLayout() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { summary } = useCart();

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
            {/* Header / Nav */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                            <HiOutlineScissors className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
                            StitchFlow <span className="text-primary-600 dark:text-primary-500">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
                        <Link to="/" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">Home</Link>
                        <Link to="/services" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">Services</Link>
                        <Link to="/products" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">Products</Link>
                        <Link to="/my-orders" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">My Orders</Link>
                        <Link to="/cart" className="relative text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                            <HiOutlineShoppingCart className="w-5 h-5" />
                            Cart
                            {summary.itemCount > 0 ? <span className="ml-1 inline-flex items-center justify-center text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white">{summary.itemCount}</span> : null}
                        </Link>
                        <Link to="/book-appointment" className="btn-primary py-2 shadow-lg shadow-primary-500/20">Book Now</Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-neutral-600 dark:text-neutral-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenuAlt3 className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-4 shadow-xl">
                        <Link to="/" className="block text-neutral-600 dark:text-neutral-400 font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/services" className="block text-neutral-600 dark:text-neutral-400 font-medium" onClick={() => setIsMenuOpen(false)}>Services</Link>
                        <Link to="/products" className="block text-neutral-600 dark:text-neutral-400 font-medium" onClick={() => setIsMenuOpen(false)}>Products</Link>
                        <Link to="/my-orders" className="block text-neutral-600 dark:text-neutral-400 font-medium" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                        <Link to="/cart" className="block text-neutral-600 dark:text-neutral-400 font-medium" onClick={() => setIsMenuOpen(false)}>Cart ({summary.itemCount})</Link>
                        <Link to="/book-appointment" className="block btn-primary text-center py-2" onClick={() => setIsMenuOpen(false)}>Book Appointment</Link>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full overflow-hidden">
                <Outlet />
            </main>

            {/* WhatsApp Floating Chat */}
            <a 
                href="https://wa.me/919876543210?text=Hello,%20I%20would%20like%20to%20inquire%20about%20your%20tailoring%20services." 
                target="_blank" 
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl shadow-[#25D366]/30 hover:scale-110 hover:-translate-y-1 transition-all flex items-center justify-center group"
                aria-label="Chat on WhatsApp"
            >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
                </svg>
            </a>

            {/* Footer */}
            <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
                            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-primary-500/10">
                                <HiOutlineScissors className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-display font-bold text-lg text-neutral-900 dark:text-white">StitchFlow AI</span>
                        </Link>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                            Premium tailoring and boutique services powered by modern technology. Excellence in every stitch.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><Link to="/services" className="hover:text-primary-600 transition-colors">Our Services</Link></li>
                            <li><Link to="/products" className="hover:text-primary-600 transition-colors">Product Catalog</Link></li>
                            <li><Link to="/cart" className="hover:text-primary-600 transition-colors">Cart</Link></li>
                            <li><Link to="/my-orders" className="hover:text-primary-600 transition-colors">My Orders</Link></li>
                            <li><Link to="/book-appointment" className="hover:text-primary-600 transition-colors">Book an Appointment</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Contact Us</h4>
                        <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            <li>123 Fashion Street, Mumbai, India</li>
                            <li>+91 98765 43210</li>
                            <li>hello@stitchflow.ai</li>
                        </ul>
                        {/* 100% width embedded map */}
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                            <iframe 
                                title="Shop Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120562.19321743603!2d72.77113176767718!3d19.07604314417066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700669146193!5m2!1sen!2sin" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 text-sm text-center text-neutral-400">
                    &copy; {new Date().getFullYear()} StitchFlow AI Tailors. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
