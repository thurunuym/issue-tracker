import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList, User, Mail, Lock } from 'lucide-react';
import { z } from 'zod';
import { useAppDispatch } from '../app/store';
import { setCredentials } from '../features/auth/authSlice';
import authApi from '../services/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
});

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (values: typeof form) => authApi.register(values),
    onSuccess: (data) => {
      // Validate response data
      if (!data.user || !data.user._id || !data.user.email) {
        toast.error('Registration successful but authentication failed. Please log in manually.');
        navigate('/login');
        return;
      }

      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          role: data.role,
          permissions: data.permissions,
        })
      );

      // Store user details in localStorage
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.role);

      toast.success(`Welcome ${data.user.name}! Account created successfully.`);
      navigate('/');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register. Please check your credentials.';
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

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Please fix the validation errors below.');
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-950 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-150 shadow-xl dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 flex items-center justify-center rounded-xl text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mb-4 shadow-sm">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-8">
            Create Account
          </h2>
          <p className="mt-1.5 text-sm text-gray-550 dark:text-gray-400">
            Sign up to access the issue tracking system
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              id="name"
              name="name"
              label="Full Name"
              placeholder="e.g. Rachel Adams"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              disabled={mutation.isPending}
              className="pl-10"
            />
            <div className="absolute left-3 top-[38px] text-gray-400 dark:text-gray-500 pointer-events-none">
              <User className="h-[18px] w-[18px]" />
            </div>
          </div>

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
              className="pl-10"
            />
            <div className="absolute left-3 top-[38px] text-gray-400 dark:text-gray-500 pointer-events-none">
              <Mail className="h-[18px] w-[18px]" />
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
              className="pl-10"
            />
            <div className="absolute left-3 top-[38px] text-gray-400 dark:text-gray-500 pointer-events-none">
              <Lock className="h-[18px] w-[18px]" />
            </div>
            
            {form.password && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li className={form.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {form.password.length >= 8 ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {/[A-Z]/.test(form.password) ? '✓' : '✗'} One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {/[a-z]/.test(form.password) ? '✓' : '✗'} One lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {/[0-9]/.test(form.password) ? '✓' : '✗'} One number (0-9)
                  </li>
                  <li className={/[!@#$%^&*]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {/[!@#$%^&*]/.test(form.password) ? '✓' : '✗'} One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full text-sm py-2.5 h-11 font-semibold"
              isLoading={mutation.isPending}
            >
              Register Now
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-550 dark:text-gray-400">Already registered? </span>
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-400"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;