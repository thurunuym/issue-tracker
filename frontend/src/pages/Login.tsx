import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList, Mail, Lock } from 'lucide-react';
import { useAppDispatch } from '../app/store';
import { setCredentials } from '../features/auth/authSlice';
import authApi from '../services/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (values: typeof form) => authApi.login(values),
    onSuccess: (data) => {
      // Set the global auth store
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          role: data.role,
          permissions: data.permissions,
        })
      );
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.role);

      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: Record<string, string> = {};
    if (!form.email || !form.email.includes('@')) {
      fieldErrors.email = 'Please enter a valid email address';
    }
    if (!form.password || form.password.length < 6) {
      fieldErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-950 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-150 shadow-xl dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 flex items-center justify-center rounded-xl text-blue-600 dark:bg-blue-950/40 dark:text-blue-450 mb-4 shadow-sm">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-8">
            Access System
          </h2>
          <p className="mt-1.5 text-sm text-gray-550 dark:text-gray-400">
            Log in to manage tracker tickets
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="e.g. developer@tracker.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={mutation.isPending}
              className="pl-9.5"
            />
            <div className="absolute left-3.5 top-10 text-gray-450 dark:text-gray-500 pointer-events-none">
              <Mail className="h-4.2 w-4.2" />
            </div>
          </div>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={mutation.isPending}
              className="pl-9.5"
            />
            <div className="absolute left-3.5 top-10 text-gray-450 dark:text-gray-500 pointer-events-none">
              <Lock className="h-4.2 w-4.2" />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full text-sm py-2.5 h-11 font-semibold"
              isLoading={mutation.isPending}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-550 dark:text-gray-400">Don't have an account? </span>
          <Link
            to="/register"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-450 dark:hover:text-blue-400"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
