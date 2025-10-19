// WheelchairRacer/frontend/src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session (user clicked the reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidToken(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to sign in page after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
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
            Create a new password
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
            Enter your new password below
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
              Password reset successful!
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-body)' }}>
              Your password has been successfully updated.
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-body)' }}>
              Redirecting to sign in page...
            </p>
          </div>
        ) : !validToken ? (
          /* Invalid Token Message */
          <div className="card p-6 text-center" style={{ borderLeft: '4px solid #C33' }}>
            <div className="flex justify-center mb-4">
              <svg
                className="h-12 w-12"
                style={{ color: '#C33' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>
              Invalid or expired link
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-body)' }}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn-primary"
            >
              Request new reset link
            </button>
          </div>
        ) : (
          /* Reset Password Form */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* New Password field */}
              <div>
                <label htmlFor="password" className="label">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password"
                  minLength={6}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-body)' }}>
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%',
                          backgroundColor: password.length < 6 ? '#C33' : password.length < 10 ? '#FB3' : 'var(--color-accent)'
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-body)' }}>
                      {password.length < 6
                        ? 'Weak'
                        : password.length < 10
                        ? 'Good'
                        : 'Strong'}
                    </span>
                  </div>
                </div>
              )}
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
                  Updating...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Back to sign in link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="text-sm"
                style={{ color: 'var(--color-text-body)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
