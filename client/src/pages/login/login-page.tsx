import { useAuth } from '@features/auth/model/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(8).max(128),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : '/dashboard';

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign in failed';
      setSubmitError(message);
    }
  });

  return (
    <div className="mx-auto max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Log in</h1>
      <p className="mt-2 text-sm text-neutral-600">
        <Link to="/register" className="text-neutral-900 underline">
          Create an account
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            {...form.register('email')}
          />
          {form.formState.errors.email !== undefined && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            {...form.register('password')}
          />
          {form.formState.errors.password !== undefined && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>
        {submitError !== null && <p className="text-sm text-red-600">{submitError}</p>}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {form.formState.isSubmitting ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
