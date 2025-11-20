'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface LinkStats {
  id: number;
  code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_at: string | null;
  created_at: string;
}

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [code]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${code}`);

      if (response.status === 404) {
        setError('Link not found');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
      setError('');
    } catch (err) {
      setError('Failed to load link statistics. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Copied to clipboard',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const shortUrl = typeof window !== 'undefined' ? `${window.location.origin}/${code}` : '';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
          <div className="animate-pulse text-gray-500">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error || 'Link not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Link Statistics</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Short Code</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-blue-600">{stats.code}</span>
              <button
                onClick={() => copyToClipboard(stats.code)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Copy Code
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Short URL</h3>
            <div className="flex items-center gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium break-all"
              >
                {shortUrl}
              </a>
              <button
                onClick={() => copyToClipboard(shortUrl)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
              >
                Copy URL
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Target URL</h3>
            <div className="flex items-center gap-3">
              <a
                href={stats.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {stats.target_url}
              </a>
              <button
                onClick={() => copyToClipboard(stats.target_url)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clicks</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_clicks}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-sm font-medium text-gray-900">{formatDate(stats.created_at)}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Clicked</h3>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(stats.last_clicked_at)}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={async () => {
                const result = await Swal.fire({
                  icon: 'warning',
                  title: 'Delete Link?',
                  text: `Are you sure you want to delete the link "${code}"?`,
                  showCancelButton: true,
                  confirmButtonText: 'Yes, Delete',
                  cancelButtonText: 'Cancel',
                  confirmButtonColor: '#dc2626',
                  cancelButtonColor: '#6b7280',
                });

                if (result.isConfirmed) {
                  try {
                    const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
                    if (res.ok) {
                      await Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Link has been deleted',
                        timer: 1500,
                        showConfirmButton: false,
                      });
                      router.push('/');
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete link',
                      });
                    }
                  } catch {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Failed to delete link',
                    });
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Delete Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
