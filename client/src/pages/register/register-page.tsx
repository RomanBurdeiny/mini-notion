import { useAuth } from '@features/auth/model/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Registration failed';
      setSubmitError(message);
    }
  });

  return (
    <div className="mx-auto max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Register</h1>
      <p className="mt-2 text-sm text-neutral-600">
        <Link to="/login" className="text-neutral-900 underline">
          Already have an account
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-neutral-700">
            Name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            {...form.register('name')}
          />
          {form.formState.errors.name !== undefined && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="register-email"
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
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-neutral-700"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
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
          {form.formState.isSubmitting ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
