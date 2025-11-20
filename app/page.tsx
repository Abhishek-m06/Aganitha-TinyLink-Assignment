'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface Link {
  id: number;
  code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_at: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
      setError('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Links',
        text: 'Failed to load links. Please refresh the page.',
        confirmButtonColor: '#2563eb',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    // Validate URL
    if (!targetUrl.trim()) {
      setFormError('Please enter a URL');
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      setFormError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Validate custom code if provided
    if (customCode && !/^[A-Za-z0-9]{6,8}$/.test(customCode)) {
      setFormError('Custom code must be 6-8 alphanumeric characters');
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          customCode: customCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Failed to create link');
        return;
      }

      const baseUrl = window.location.origin;
      const shortUrl = `${baseUrl}/${data.code}`;

      Swal.fire({
        icon: 'success',
        title: 'Link Created!',
        html: `
          <p class="mb-2">Your short link is ready:</p>
          <div class="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
            ${shortUrl}
          </div>
          <p class="mt-3 text-sm text-gray-600">Short code: <strong>${data.code}</strong></p>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Copy Link',
        showCancelButton: true,
        cancelButtonText: 'Close',
        confirmButtonColor: '#2563eb',
      }).then((result) => {
        if (result.isConfirmed) {
          navigator.clipboard.writeText(shortUrl);
          Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Link copied to clipboard',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });

      setTargetUrl('');
      setCustomCode('');
      setShowForm(false);
      fetchLinks();
    } catch (err) {
      setFormError('Failed to create link. Please try again.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
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

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `Link "${code}" has been deleted successfully`,
        timer: 2000,
        showConfirmButton: false,
      });

      fetchLinks();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete link. Please try again.',
      });
      console.error(err);
    }
  };

  const copyToClipboard = (code: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${code}`;
    navigator.clipboard.writeText(url);

    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `Link copied to clipboard: ${url}`,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
    });
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.target_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Link'}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Create New Short Link</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Target URL *
              </label>
              <input
                type="text"
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/your-long-url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formLoading}
              />
            </div>

            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Short Code (optional)
              </label>
              <input
                type="text"
                id="customCode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="e.g., docs (6-8 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formLoading}
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                6-8 alphanumeric characters. Leave empty for random code.
              </p>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {formLoading ? 'Creating...' : 'Create Short Link'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by code or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-pulse">Loading links...</div>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No links match your search.' : 'No links yet. Create your first short link!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Clicked
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/code/${link.code}`}
                        className="font-mono text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {link.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900" title={link.target_url}>
                          {truncateUrl(link.target_url)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{link.total_clicks}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(link.last_clicked_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(link.code)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
