import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';
import { type User } from '../types';

interface SignInModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSignIn: (user: User) => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (isSignUp) {
      // Mock sign-up success
      toast.success('Account created successfully! You are now signed in.');
      onSignIn({ name, email });
    } else {
      // Mock sign-in success
      // In a real app, you'd fetch the user's name from your DB.
      onSignIn({ name: email.split('@')[0], email });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-950"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 sm:p-8 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <h3 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {isSignUp ? 'Get started with your own workflows.' : 'Sign in to access your workflows.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          {isSignUp && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
              />
            </div>
          )}
          
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <Button type="submit" className="w-full">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
          <button onClick={handleToggleMode} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default SignInModal;