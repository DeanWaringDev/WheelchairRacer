// WheelchairRacer/frontend/src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            className="mx-auto h-20 w-20"
            src="/logo.svg"
            alt="Wheelchair Racer Logo"
          />
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: 'var(--color-secondary)' }}>
            Reset your password
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="card p-6 text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="h-12 w-12"
                style={{ color: 'var(--color-accent)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>
              Check your email
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-body)' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--color-text-body)' }}>
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <div className="space-y-2">
              <Link
                to="/signin"
                className="btn-primary block w-full text-center"
              >
                Back to Sign In
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="btn-secondary w-full"
              >
                Send another email
              </button>
            </div>
          </div>
        ) : (
          /* Reset Form */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md p-3" style={{ backgroundColor: '#FEE', border: '1px solid #FCC' }}>
                <p className="text-sm" style={{ color: '#C33' }}>{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    style={{ color: 'var(--color-white)' }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send reset link'
              )}
            </button>

            {/* Additional links */}
            <div className="text-center space-y-2">
              <div>
                <Link
                  to="/signin"
                  className="text-sm"
                  style={{ color: 'var(--color-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  ← Back to Sign In
                </Link>
              </div>
              <div>
                <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                  Don't have an account?{' '}
                  <Link 
                    to="/signin"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Sign up here
                  </Link>
                </span>
              </div>
            </div>
          </form>
        )}

        {/* Help text */}
        {!success && (
          <div className="card p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 mr-2 flex-shrink-0"
                style={{ color: 'var(--color-accent)' }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--color-secondary)' }}>Having trouble?</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Make sure you use the email address associated with your account</li>
                  <li>Check your spam folder if you don't see the email</li>
                  <li>The reset link expires after 1 hour</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;
