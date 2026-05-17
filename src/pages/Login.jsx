import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

// ─── Reusable Components ─────────────────────────────────────────────────────

const InputField = ({ label, type, name, value, onChange, onBlur, disabled, required = true, error }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            required={required}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`w-full px-4 py-3 border rounded-xl outline-none transition-all duration-200
                ${error
                ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 hover:border-gray-300'
            }
                ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white'}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && (
            <p id={`${name}-error`} className="text-red-500 text-xs flex items-center gap-1 animate-fadeIn">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
            </p>
        )}
    </div>
);

const SubmitButton = ({ isLoading, children }) => (
    <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold
            hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200
            active:scale-[0.98] transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
            flex items-center justify-center gap-2 text-sm sm:text-base"
    >
        {isLoading ? (
            <>
                <svg
                    className="animate-spin h-5 w-5 text-white flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                Processing...
            </>
        ) : (
            children
        )}
    </button>
);

const ToggleAuthMode = ({ isLogin, onToggle }) => (
    <p className="text-center mt-6 text-sm text-gray-600">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
            type="button"
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 hover:underline-offset-4 transition-all"
        >
            {isLogin ? 'Sign Up' : 'Login'}
        </button>
    </p>
);

// ─── Validation ───────────────────────────────────────────────────────────────

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Please enter a valid email';
    return null;
};

const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
};

const validateFullName = (name) => {
    if (!name || name.trim().length < 2) return 'Full name is required (min 2 characters)';
    return null;
};

// ─── Decorative Background Blobs ─────────────────────────────────────────────

const BackgroundBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
    </div>
);

// ─── Main Login Component ─────────────────────────────────────────────────────

export default function Login() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // ─── Mutations ────────────────────────────────────────────────────────────
    const loginMutation = useMutation({
        mutationFn: async (data) => {
            const params = new URLSearchParams();
            params.append('username', data.email);
            params.append('password', data.password);
            const response = await api.post('/auth/login', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify({ email: formData.email }));
            toast.success('Welcome back!', { icon: '👋' });
            navigate('/dashboard', { replace: true });
        },
        onError: (error) => {
            const message = error.response?.data?.detail || 'Invalid credentials. Please try again.';
            toast.error(message, { duration: 4000 });
        },
    });

    const signupMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/auth/signup', {
                email: data.email,
                password: data.password,
                full_name: data.full_name,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Account created successfully! Please sign in.', { icon: '🎉' });
            setIsLogin(true);
            setFormData({ email: '', password: '', full_name: '' });
            setErrors({});
            setTouched({});
        },
        onError: (error) => {
            const message = error.response?.data?.detail || 'Signup failed. Please try again.';
            toast.error(message, { duration: 4000 });
        },
    });

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validateField = (fieldName, value) => {
        let error = null;
        switch (fieldName) {
            case 'email':    error = validateEmail(value);                        break;
            case 'password': error = validatePassword(value);                     break;
            case 'full_name': if (!isLogin) error = validateFullName(value);      break;
            default: break;
        }
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
        return !error;
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    const validateForm = () => {
        const fields = isLogin ? ['email', 'password'] : ['email', 'password', 'full_name'];
        let isValid = true;
        fields.forEach((field) => {
            if (!validateField(field, formData[field])) isValid = false;
        });
        setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isLogin) {
            loginMutation.mutate(formData);
        } else {
            signupMutation.mutate(formData);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin((prev) => !prev);
        setFormData({ email: '', password: '', full_name: '' });
        setErrors({});
        setTouched({});
    };

    const isLoading = loginMutation.isPending || signupMutation.isPending;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
            <BackgroundBlobs />

            <div className="w-full max-w-md relative z-10 animate-fadeIn">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-100/50 p-6 sm:p-8 border border-white/60">

                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl sm:text-3xl shadow-lg shadow-blue-200 mb-4">
                            🏥
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            Healthcare Platform
                        </h1>
                        <p className="text-gray-500 mt-1.5 text-sm">
                            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
                        </p>
                    </div>

                    {/* Auth Mode Pills */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
                        <button
                            type="button"
                            onClick={() => !isLogin && toggleAuthMode()}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isLogin
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => isLogin && toggleAuthMode()}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                !isLogin
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                        {/* Full Name — signup only */}
                        {!isLogin && (
                            <div className="animate-fadeIn">
                                <InputField
                                    label="Full Name"
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isLoading}
                                    error={touched.full_name ? errors.full_name : null}
                                />
                            </div>
                        )}

                        <InputField
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isLoading}
                            error={touched.email ? errors.email : null}
                        />

                        <InputField
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isLoading}
                            error={touched.password ? errors.password : null}
                        />

                        {/* Forgot password — login only */}
                        {isLogin && (
                            <div className="flex justify-end -mt-1">
                                <button
                                    type="button"
                                    onClick={() => toast('Coming soon!', { icon: '🔧' })}
                                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <div className="pt-1">
                            <SubmitButton isLoading={isLoading}>
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </SubmitButton>
                        </div>
                    </form>

                    <ToggleAuthMode isLogin={isLogin} onToggle={toggleAuthMode} />
                </div>

                {/* Footer */}
                <p className="text-center mt-5 text-xs text-gray-400 flex items-center justify-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Protected by industry-standard encryption
                </p>
            </div>
        </div>
    );
}