import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

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
      toast.success('Login successful!');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">??</div>
          <h1 className="text-3xl font-bold text-gray-800">Healthcare Platform</h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={isLoading} />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} disabled={isLoading} />
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setFormData({ email: '', password: '', full_name: '' }); }} className="text-blue-600 hover:underline font-medium">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
