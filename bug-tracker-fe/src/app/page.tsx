'use client';

import { useState } from 'react';
import { Popcorn, CheckCircle2, Loader2, Send } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BugReportPage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reproSteps: '',
    reporterContact: '',
    priority: 2, // Default to Normal (2)
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${apiUrl}/v1/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          reproSteps: formData.reproSteps || undefined,
          reporterContact: formData.reporterContact || undefined,
          priority: Number(formData.priority),
        }),
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data?.error || `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      setStatus('success');
      setFormData({
        title: '',
        description: '',
        reproSteps: '',
        reporterContact: '',
        priority: 2,
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main
      className={cn(
        'min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300',
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
      )}
    >
      <div
        className={cn(
          'max-w-md mx-auto border-2 rounded-2xl overflow-hidden md:max-w-2xl p-10 transition-all duration-300 shadow-2xl',
          theme === 'dark'
            ? 'bg-gray-950 border-yellow-500/30 shadow-yellow-500/10'
            : 'bg-white border-green-500/30 shadow-green-500/10'
        )}
      >
        <div className="flex items-center gap-4 mb-8">
          <div
            className={cn(
              'p-3 rounded-xl shadow-lg transition-all duration-300',
              theme === 'dark'
                ? 'bg-yellow-500 shadow-yellow-500/30'
                : 'bg-green-500 shadow-green-500/30'
            )}
          >
            <Popcorn className={cn('w-8 h-8', theme === 'dark' ? 'text-black' : 'text-white')} />
          </div>
          <div>
            <h1
              className={cn(
                'text-3xl font-black uppercase tracking-tighter italic transition-colors',
                theme === 'dark' ? 'text-yellow-500' : 'text-green-600'
              )}
            >
              BUG REPORT
            </h1>
            <p
              className={cn(
                'text-xs font-bold uppercase tracking-widest transition-colors',
                theme === 'dark' ? 'text-yellow-500/50' : 'text-green-600/50'
              )}
            >
              Submission Portal
            </p>
          </div>
        </div>

        <p
          className={cn(
            'mb-10 font-medium border-l-4 pl-4 transition-all duration-300',
            theme === 'dark' ? 'text-gray-400 border-yellow-500' : 'text-gray-600 border-green-500'
          )}
        >
          Encountered a bug? Fill out the form below and we'll fix I hope...
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="space-y-2">
            <label
              htmlFor="title"
              className={cn(
                'block text-xs font-black uppercase tracking-widest transition-colors',
                theme === 'dark' ? 'text-yellow-500' : 'text-green-600'
              )}
            >
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="What's breaking?"
              className={cn(
                'w-full px-5 py-3 border rounded-xl outline-none transition-all font-medium',
                theme === 'dark'
                  ? 'bg-black border-yellow-500/20 text-white placeholder-gray-700 focus:border-yellow-500 focus:ring-yellow-500'
                  : 'bg-white border-green-500/20 text-black placeholder-gray-300 focus:border-green-500 focus:ring-green-500'
              )}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className={cn(
                'block text-xs font-black uppercase tracking-widest transition-colors',
                theme === 'dark' ? 'text-yellow-500' : 'text-green-600'
              )}
            >
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Give us the full story..."
              className={cn(
                'w-full px-5 py-3 border rounded-xl outline-none transition-all font-medium',
                theme === 'dark'
                  ? 'bg-black border-yellow-500/20 text-white placeholder-gray-700 focus:border-yellow-500 focus:ring-yellow-500'
                  : 'bg-white border-green-500/20 text-black placeholder-gray-300 focus:border-green-500 focus:ring-green-500'
              )}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reproSteps"
              className={cn(
                'block text-xs font-black uppercase tracking-widest transition-colors',
                theme === 'dark' ? 'text-yellow-500' : 'text-green-600'
              )}
            >
              Steps to Reproduce
            </label>
            <textarea
              id="reproSteps"
              name="reproSteps"
              rows={3}
              value={formData.reproSteps}
              onChange={handleChange}
              placeholder="1. Go to... 2. Click..."
              className={cn(
                'w-full px-5 py-3 border rounded-xl outline-none transition-all font-medium',
                theme === 'dark'
                  ? 'bg-black border-yellow-500/20 text-white placeholder-gray-700 focus:border-yellow-500 focus:ring-yellow-500'
                  : 'bg-white border-green-500/20 text-black placeholder-gray-300 focus:border-green-500 focus:ring-green-500'
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label
                htmlFor="priority"
                className={cn(
                  'block text-xs font-black uppercase tracking-widest transition-colors',
                  theme === 'dark' ? 'text-yellow-500' : 'text-green-600'
                )}
              >
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={cn(
                  'w-full px-5 py-3 border rounded-xl outline-none transition-all font-bold appearance-none cursor-pointer',
                  theme === 'dark'
                    ? 'bg-black border-yellow-500/20 text-white focus:border-yellow-500'
                    : 'bg-white border-green-500/20 text-black focus:border-green-500'
                )}
              >
                <option value={0}>CRITICAL</option>
                <option value={1}>MODERATE</option>
                <option value={2}>NORMAL</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reporterContact"
                className={cn(
                  'block text-xs font-black uppercase tracking-widest transition-colors',
                  theme === 'dark' ? 'text-yellow-500' : 'text-green-600'
                )}
              >
                Contact Info
              </label>
              <input
                type="text"
                id="reporterContact"
                name="reporterContact"
                value={formData.reporterContact}
                onChange={handleChange}
                placeholder="Email or Discord"
                className={cn(
                  'w-full px-5 py-3 border rounded-xl outline-none transition-all font-medium',
                  theme === 'dark'
                    ? 'bg-black border-yellow-500/20 text-white placeholder-gray-700 focus:border-yellow-500'
                    : 'bg-white border-green-500/20 text-black placeholder-gray-300 focus:border-green-500'
                )}
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={status === 'loading'}
              className={cn(
                'w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black transition-all shadow-xl uppercase tracking-tighter text-lg italic',
                theme === 'dark'
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-green-500 text-white hover:bg-green-400',
                status === 'loading' && 'opacity-50 cursor-not-allowed'
              )}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Send Report
                </>
              )}
            </button>
          </div>

          {status === 'success' && (
            <div
              className={cn(
                'flex items-center gap-4 p-5 border rounded-xl transition-all duration-300',
                theme === 'dark'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                  : 'bg-green-500/10 border-green-500/30 text-green-600'
              )}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-black uppercase tracking-tight italic">
                Submission Received! Our crew is on it.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div
              className={cn(
                'flex items-center gap-4 p-5 border rounded-xl transition-all duration-300',
                theme === 'dark'
                  ? 'bg-red-950/40 border-red-500/30 text-red-500'
                  : 'bg-red-50 border-red-200 text-red-600'
              )}
            >
              <Popcorn className="w-6 h-6 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-black uppercase tracking-widest italic mb-1">Critical Error</p>
                <p className="font-medium">{errorMessage}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
