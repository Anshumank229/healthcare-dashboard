import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout/Layout';

const queryClient = new QueryClient();

function PrivateRoute() {
    const token = localStorage.getItem('access_token');
    return token ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;