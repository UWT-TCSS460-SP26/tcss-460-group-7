'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BugReportPage() {
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
          // If reproSteps or reporterContact are empty, send undefined or null
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
        throw new Error(data?.error || `Server responded with ${response.status}: ${response.statusText}`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden md:max-w-2xl p-8">
        <div className="mb-4 text-xs font-mono text-gray-500 text-right">
          Target API: <span className="text-blue-400">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/issues</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-900/30 p-2 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Report a Bug</h1>
        </div>

        <p className="text-gray-400 mb-8">
          Help us improve! Fill out the form below to report an issue or suggest a change.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of what's happening"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="reproSteps" className="block text-sm font-medium text-gray-300 mb-1">
              Steps to Reproduce
            </label>
            <textarea
              id="reproSteps"
              name="reproSteps"
              rows={3}
              value={formData.reproSteps}
              onChange={handleChange}
              placeholder="1. Go to... 2. Click on..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value={0} className="bg-gray-800">High</option>
                <option value={1} className="bg-gray-800">Medium</option>
                <option value={2} className="bg-gray-800">Normal</option>
              </select>
            </div>

            <div>
              <label htmlFor="reporterContact" className="block text-sm font-medium text-gray-300 mb-1">
                Contact Info
              </label>
              <input
                type="text"
                id="reporterContact"
                name="reporterContact"
                value={formData.reporterContact}
                onChange={handleChange}
                placeholder="Email or Discord"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'loading'}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-lg",
                status === 'loading' 
                  ? "bg-blue-800/50 cursor-not-allowed text-gray-400" 
                  : "bg-blue-600 hover:bg-blue-500 active:transform active:scale-[0.98] shadow-blue-900/20"
              )}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-800/50 rounded-lg text-green-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Thank you! Your bug report has been submitted successfully.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-red-300">Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
