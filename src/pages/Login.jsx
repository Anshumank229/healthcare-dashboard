import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUser, FaHeartbeat, FaShieldAlt, FaChartLine, FaCalendarCheck } from 'react-icons/fa';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const params = new URLSearchParams();
      params.append('username', data.email);
      params.append('password', data.password);
      const response = await api.post('/auth/login', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify({ email: formData.email }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: () => toast.error('Invalid credentials')
  });

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/signup', { email: data.email, password: data.password, full_name: data.full_name });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account created! Please login.');
      setIsLogin(true);
      setFormData({ email: '', password: '', full_name: '' });
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Signup failed')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) loginMutation.mutate(formData);
    else signupMutation.mutate(formData);
  };

  const isLoading = loginMutation.isPending || signupMutation.isPending;

  const features = [
    { icon: FaShieldAlt, title: 'HIPAA Compliant', desc: 'Enterprise-grade security for patient data' },
    { icon: FaChartLine, title: 'AI Predictions', desc: 'ML-powered no-show risk analysis' },
    { icon: FaCalendarCheck, title: 'Smart Scheduling', desc: 'Automated appointment management' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-700 via-primary-800 to-surface-900 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-healthcare-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <FaHeartbeat className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MedFlow</h1>
              <p className="text-xs text-primary-200 font-medium uppercase tracking-widest">Healthcare Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Modern Healthcare<br />
            <span className="text-primary-300">Management Platform</span>
          </h2>
          <p className="text-lg text-primary-200 mb-12 max-w-md leading-relaxed">
            Streamline your practice with intelligent scheduling, patient management, and AI-powered insights.
          </p>

          {/* Feature cards */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-xl bg-white/10">
                  <f.icon size={18} className="text-primary-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-sm text-primary-300 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-healthcare-600 flex items-center justify-center">
              <FaHeartbeat className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">MedFlow</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-glass p-8 border border-surface-100 dark:border-surface-700">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
                {isLogin ? 'Sign in to your healthcare dashboard' : 'Get started with your free account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  required
                  icon={FaUser}
                  placeholder="Dr. John Smith"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={isLoading}
                />
              )}
              <Input
                label="Email Address"
                type="email"
                required
                icon={FaEnvelope}
                placeholder="doctor@clinic.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              <Input
                label="Password"
                type="password"
                required
                icon={FaLock}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-surface-600 dark:text-surface-400">Remember me</span>
                  </label>
                  <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                loading={isLoading}
                className="w-full py-3 text-base rounded-xl"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: '', password: '', full_name: '' });
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-surface-400 mt-6">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}
