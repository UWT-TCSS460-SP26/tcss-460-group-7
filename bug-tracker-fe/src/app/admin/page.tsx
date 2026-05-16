'use client';

import { useState, useCallback } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Popcorn
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Issue {
  id: number;
  title: string;
  description: string;
  reproSteps: string | null;
  reporterContact: string | null;
  priority: number;
  status: 'UNSOLVED' | 'IN_PROGRESS' | 'FIXED';
  createdAt: string;
  author?: {
    username: string;
    display_name: string | null;
  };
}

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [token, setToken] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleTokenChange = (value: string) => {
    const cleaned = value.replace(/^Bearer\s+/i, '').trim();
    setToken(cleaned);
  };

  const fetchIssues = useCallback(async (authToken: string) => {
    if (!authToken) return;
    setLoading(true);
    setError(null);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${apiUrl}/v1/issues`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server responded with ${response.status}: ${response.statusText}`);
      }

      setIssues(data);
      setIsAuthorized(true);
    } catch (err: any) {
      setError(err.message);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiUrl}/v1/issues/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, status: newStatus as any } : issue
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiUrl}/v1/issues/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete issue');
      
      setIssues(prev => prev.filter(issue => issue.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getPriorityBadge = (priority: number) => {
    const baseClasses = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter italic transition-all duration-300";
    switch (priority) {
      case 0: return <span className={cn(baseClasses, theme === 'dark' ? "bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-red-600 text-white shadow-lg")}>Immediate Action</span>;
      case 1: return <span className={cn(baseClasses, theme === 'dark' ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "bg-green-500 text-white shadow-lg")}>Priority</span>;
      default: return <span className={cn(baseClasses, theme === 'dark' ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500")}>Routine</span>;
    }
  };

  return (
    <main className={cn(
      "min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300",
      theme === 'dark' ? "bg-black text-white" : "bg-gray-50 text-black"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl shadow-lg transition-all duration-300",
              theme === 'dark' ? "bg-yellow-500 text-black shadow-yellow-500/30" : "bg-green-500 text-white shadow-green-500/30"
            )}>
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h1 className={cn(
                "text-4xl font-black uppercase tracking-tighter italic transition-colors",
                theme === 'dark' ? "text-yellow-500" : "text-green-600"
              )}>
                ADMIN DASHBOARD
              </h1>
              <p className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors",
                theme === 'dark' ? "text-yellow-500/50" : "text-green-600/50"
              )}>
                Management Logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="password"
              placeholder="Admin Access Key"
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className={cn(
                "px-5 py-3 border rounded-xl outline-none w-72 transition-all font-medium",
                theme === 'dark' 
                  ? "bg-gray-950 border-yellow-500/20 text-white focus:border-yellow-500" 
                  : "bg-white border-green-500/20 text-black focus:border-green-500"
              )}
            />
            <button
              onClick={() => fetchIssues(token)}
              disabled={loading || !token}
              className={cn(
                "px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 font-black uppercase tracking-tighter italic flex items-center gap-2",
                theme === 'dark' 
                  ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/20" 
                  : "bg-green-500 text-white hover:bg-green-400 shadow-green-500/20",
                (loading || !token) && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Access Logs
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className={cn(
            "mb-8 flex items-center gap-4 p-5 border rounded-xl transition-all duration-300",
            theme === 'dark' ? "bg-red-950/40 border-red-500/30 text-red-500" : "bg-red-50 border-red-200 text-red-600"
          )}>
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="font-bold uppercase tracking-tight italic">{error}</p>
          </div>
        )}

        {!isAuthorized && !loading && (
          <div className={cn(
            "flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl transition-all duration-300",
            theme === 'dark' ? "bg-gray-950 border-yellow-500/10" : "bg-white border-green-500/10"
          )}>
            <ShieldCheck className={cn("w-20 h-20 mb-6", theme === 'dark' ? "text-gray-900" : "text-gray-100")} />
            <h2 className={cn(
              "text-2xl font-black uppercase italic tracking-tighter",
              theme === 'dark' ? "text-gray-700" : "text-gray-300"
            )}>
              Access Restricted
            </h2>
            <p className={cn(
              "text-sm font-bold uppercase tracking-widest mt-2",
              theme === 'dark' ? "text-gray-800" : "text-gray-400"
            )}>
              Enter Credentials to Enter the Projection Room
            </p>
          </div>
        )}

        {isAuthorized && (
          <div className={cn(
            "border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
            theme === 'dark' ? "bg-gray-950 border-yellow-500/20" : "bg-white border-green-500/20"
          )}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn(
                    "border-b transition-colors",
                    theme === 'dark' ? "bg-yellow-500 text-black border-yellow-600" : "bg-green-500 text-white border-green-600"
                  )}>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Ref ID</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Issue Detail</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Priority</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Reporter</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={cn(
                  "divide-y transition-colors",
                  theme === 'dark' ? "divide-yellow-500/10" : "divide-green-500/10"
                )}>
                  {issues.map((issue) => (
                    <tr key={issue.id} className={cn(
                      "transition-colors group",
                      theme === 'dark' ? "hover:bg-yellow-500/[0.03]" : "hover:bg-green-500/[0.03]"
                    )}>
                      <td className={cn(
                        "px-6 py-5 text-sm font-black italic",
                        theme === 'dark' ? "text-yellow-500/40" : "text-green-500/40"
                      )}>#{issue.id}</td>
                      <td className="px-6 py-5 max-w-md">
                        <div className={cn(
                          "text-sm font-black uppercase tracking-tight mb-1 transition-colors",
                          theme === 'dark' ? "text-white" : "text-black"
                        )}>{issue.title}</div>
                        <div className={cn(
                          "text-xs font-medium leading-relaxed transition-colors",
                          theme === 'dark' ? "text-gray-500" : "text-gray-600"
                        )}>{issue.description}</div>
                      </td>
                      <td className="px-6 py-5">{getPriorityBadge(issue.priority)}</td>
                      <td className="px-6 py-5">
                        <select
                          value={issue.status}
                          onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 border outline-none cursor-pointer transition-all",
                            theme === 'dark' ? "bg-black" : "bg-white",
                            issue.status === 'FIXED' && "text-green-400 border-green-500/30",
                            issue.status === 'IN_PROGRESS' && (theme === 'dark' ? "text-yellow-500 border-yellow-500/30" : "text-orange-500 border-orange-500/30"),
                            issue.status === 'UNSOLVED' && "text-red-400 border-red-500/30"
                          )}
                        >
                          <option value="UNSOLVED">Unsolved</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="FIXED">Fixed</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "text-xs font-black uppercase tracking-tighter italic transition-colors",
                          theme === 'dark' ? "text-yellow-500/80" : "text-green-600/80"
                        )}>{issue.author?.username || 'Guest'}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{issue.reporterContact || 'No Contact'}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDelete(issue.id)}
                          className={cn(
                            "p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                            theme === 'dark' ? "text-gray-700 hover:text-red-500 hover:bg-red-500/10" : "text-gray-300 hover:text-red-600 hover:bg-red-50"
                          )}
                          title="Trash Report"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
