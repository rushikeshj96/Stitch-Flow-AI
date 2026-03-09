import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { validateEmail } from '../../utils/validators.js';

export default function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { execute, loading } = useAsync(login, {
        onSuccess: () => navigate('/dashboard'),
    });

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErrors(er => ({ ...er, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
        if (form.password.length < 6) errs.password = 'Password too short';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        await execute(form);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
                <h2 className="text-xl font-display font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Welcome back</h2>
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>Sign in to your StitchFlow account</p>
            </div>

            {/* Email */}
            <div>
                <label className="label" htmlFor="email">Email address</label>
                <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input id="email" name="email" type="email" autoComplete="email"
                        value={form.email} onChange={handleChange}
                        placeholder="you@example.com"
                        className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`} />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input id="password" name="password" type={showPass ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={form.password} onChange={handleChange}
                        placeholder="••••••••"
                        className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`} />
                    <button type="button" tabIndex={-1}
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button id="login-submit" type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3">
                {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <p className="text-center text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                    Sign up
                </Link>
            </p>
        </form>
    );
}
