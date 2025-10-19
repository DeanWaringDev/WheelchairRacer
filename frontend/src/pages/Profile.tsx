/**
 * Profile Page Component
 * 
 * User profile management page where users can:
 * - View and edit profile information (username, email)
 * - Upload and update profile picture
 * - Change password
 * - Sign out
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const Profile: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }

    // Load user profile data
    setUsername(user.user_metadata?.username || '')
    setAvatarUrl(user.user_metadata?.avatar_url || '')
  }, [user, navigate])

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      setError('Error signing out')
    } else {
      navigate('/')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await updateProfile({
      username: username.trim(),
      avatar_url: avatarUrl
    })

    if (error) {
      setError('Error updating profile: ' + error.message)
    } else {
      setMessage('Profile updated successfully!')
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError('')

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
      setMessage('Profile picture uploaded! Remember to save your profile.')
    } catch (error: any) {
      setError('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordMessage('')

    // Validation
    if (!currentPassword) {
      setPasswordError('Current password is required')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password')
      setPasswordLoading(false)
      return
    }

    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError('Current password is incorrect')
        setPasswordLoading(false)
        return
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordError('Error updating password: ' + updateError.message)
      } else {
        setPasswordMessage('Password changed successfully!')
        // Clear the form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // Hide the password section after a delay
        setTimeout(() => {
          setShowPasswordSection(false)
          setPasswordMessage('')
        }, 2000)
      }
    } catch (error: any) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="page-container py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card mb-6">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>Profile Settings</h1>
            <p style={{ color: 'var(--color-text-body)' }}>Manage your account information and preferences</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card">
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            
            {/* Profile Picture Section */}
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {avatarUrl ? (
                  <img
                    className="h-24 w-24 rounded-full object-cover"
                    style={{ border: '4px solid rgba(0,0,0,0.1)' }}
                    src={avatarUrl}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <svg className="h-12 w-12" style={{ color: 'var(--color-text-body)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="label">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium hover:file:opacity-90"
                  style={{ 
                    color: 'var(--color-text-body)',
                    backgroundColor: 'rgba(245, 124, 0, 0.1)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
                  {uploading ? 'Uploading...' : 'PNG, JPG up to 2MB'}
                </p>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email || ''}
                disabled
                className="input-field"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Messages */}
            {message && (
              <div className="card p-3" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{message}</p>
              </div>
            )}

            {error && (
              <div className="card p-3" style={{ borderLeft: '4px solid #C33' }}>
                <p className="text-sm" style={{ color: '#C33' }}>{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium"
                style={{ color: '#C33' }}
              >
                Sign Out
              </button>
              
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="btn-primary px-4 py-2 text-sm"
                  style={{ opacity: (loading || uploading) ? 0.5 : 1, cursor: (loading || uploading) ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="card mt-6">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-secondary)' }}>Change Password</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Update your password to keep your account secure</p>
              </div>
              {!showPasswordSection && (
                <button
                  onClick={() => setShowPasswordSection(true)}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Change Password
                </button>
              )}
            </div>
          </div>

          {showPasswordSection && (
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="label">
                  Current Password *
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="label">
                  New Password *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>Must be at least 6 characters</p>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: newPassword.length < 6 ? '33%' : newPassword.length < 10 ? '66%' : '100%',
                            backgroundColor: newPassword.length < 6 ? '#C33' : newPassword.length < 10 ? '#FB3' : 'var(--color-accent)'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-body)' }}>
                        {newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Re-enter new password"
                  minLength={6}
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: '#C33' }}>Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>✓ Passwords match</p>
                )}
              </div>

              {/* Password Messages */}
              {passwordMessage && (
                <div className="card p-3" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{passwordMessage}</p>
                </div>
              )}

              {passwordError && (
                <div className="card p-3" style={{ borderLeft: '4px solid #C33' }}>
                  <p className="text-sm" style={{ color: '#C33' }}>{passwordError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                    setPasswordMessage('')
                  }}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="btn-primary px-4 py-2 text-sm"
                  style={{ 
                    opacity: (passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? 0.5 : 1, 
                    cursor: (passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default Profile