import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineUser, HiOutlineMail, HiOutlineLockClosed,
    HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineEye, HiOutlineEyeOff,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { validateEmail, validatePhone, validatePassword } from '../../utils/validators.js';

const FIELDS = [
    { name: 'name', label: 'Full Name', icon: HiOutlineUser, type: 'text', placeholder: 'Riya Sharma' },
    { name: 'boutiqueName', label: 'Boutique Name', icon: HiOutlineOfficeBuilding, type: 'text', placeholder: 'Riya Creations' },
    { name: 'phone', label: 'Phone Number', icon: HiOutlinePhone, type: 'tel', placeholder: '9876543210' },
    { name: 'email', label: 'Email Address', icon: HiOutlineMail, type: 'email', placeholder: 'you@example.com' },
];

export default function SignupForm() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const { execute, loading } = useAsync(signup, {
        onSuccess: () => navigate('/dashboard'),
    });

    const [form, setForm] = useState({ name: '', boutiqueName: '', phone: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErrors(er => ({ ...er, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Full name is required';
        if (!validatePhone(form.phone)) errs.phone = 'Enter valid 10-digit Indian mobile number';
        if (!validateEmail(form.email)) errs.email = 'Enter a valid email address';
        if (!validatePassword(form.password)) errs.password = 'Min 8 chars, 1 uppercase, 1 number';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        await execute(form);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
                <h2 className="text-xl font-display font-bold text-white">Create your account</h2>
                <p className="text-slate-400 text-sm mt-1">Start managing your boutique with AI</p>
            </div>

            {FIELDS.map(({ name, label, icon: Icon, type, placeholder }) => (
                <div key={name}>
                    <label className="label" htmlFor={name}>{label}</label>
                    <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            id={name} name={name} type={type}
                            value={form[name]} onChange={handleChange}
                            placeholder={placeholder}
                            className={`input pl-10 ${errors[name] ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                </div>
            ))}

            {/* Password */}
            <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        id="password" name="password" type={showPass ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={form.password} onChange={handleChange}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button type="button" tabIndex={-1}
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Password strength indicator */}
            <PasswordStrength password={form.password} />

            <button id="signup-submit" type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2">
                {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
        </form>
    );
}

function PasswordStrength({ password }) {
    const checks = [
        { label: '8+ characters', ok: password.length >= 8 },
        { label: 'Uppercase', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /\d/.test(password) },
    ];
    if (!password) return null;
    return (
        <div className="flex gap-2 mt-1">
            {checks.map(({ label, ok }) => (
                <div key={label} className={`flex-1 h-1 rounded-full transition-colors duration-300
                                     ${ok ? 'bg-primary-500' : 'bg-white/10'}`} title={label} />
            ))}
        </div>
    );
}
