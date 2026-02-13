'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { APPLICATION_QUERY } from '@/lib/graphql/queries';
import {
  UPDATE_APPLICATION_MUTATION,
  DELETE_APPLICATION_MUTATION,
} from '@/lib/graphql/mutations';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    amountAwarded: '',
  });

  const { data, loading, error, refetch } = useQuery(APPLICATION_QUERY, {
    variables: { id: applicationId },
    onCompleted: (data) => {
      if (data.application) {
        setFormData({
          status: data.application.status,
          notes: data.application.notes || '',
          amountAwarded: data.application.amountAwarded?.toString() || '',
        });
      }
    },
  });

  const [updateApplication, { loading: updating }] = useMutation(UPDATE_APPLICATION_MUTATION, {
    onCompleted: () => {
      setIsEditing(false);
      refetch();
    },
  });

  const [deleteApplication] = useMutation(DELETE_APPLICATION_MUTATION, {
    onCompleted: () => {
      router.push('/applications');
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Application not found'}
          </p>
          <Link
            href="/applications"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const application = data.application;
  const scholarship = application.scholarship;
  const deadline = application.deadline ? new Date(application.deadline) : null;
  const daysUntilDeadline = deadline
    ? Math.floor((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleSave = async () => {
    await updateApplication({
      variables: {
        id: applicationId,
        input: {
          status: formData.status,
          notes: formData.notes || null,
          amountAwarded: formData.amountAwarded ? parseFloat(formData.amountAwarded) : null,
          submittedAt: formData.status === 'SUBMITTED' ? new Date().toISOString() : null,
        },
      },
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this application? This cannot be undone.')) {
      await deleteApplication({ variables: { id: applicationId } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/applications"
            className="inline-flex items-center text-purple-100 hover:text-white mb-4"
          >
            ← Back to Applications
          </Link>
          <h1 className="text-4xl font-bold mb-2">{scholarship.title}</h1>
          <p className="text-purple-100 text-lg">{scholarship.organization}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Application Status</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.status === 'ACCEPTED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Awarded ($)
                      </label>
                      <input
                        type="number"
                        value={formData.amountAwarded}
                        onChange={(e) =>
                          setFormData({ ...formData, amountAwarded: e.target.value })
                        }
                        placeholder="5000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add any notes about this application..."
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Current Status</div>
                    <div className="text-lg font-semibold">
                      {STATUS_OPTIONS.find((o) => o.value === application.status)?.label}
                    </div>
                  </div>

                  {application.submittedAt && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Submitted On</div>
                      <div className="text-lg font-semibold">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {application.amountAwarded && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Amount Awarded</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${application.amountAwarded.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {application.notes && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Notes</div>
                      <div className="text-gray-700 whitespace-pre-wrap">{application.notes}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Progress</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full transition-all"
                          style={{ width: `${application.progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-sm font-semibold">{application.progressPercentage}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Essays Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Essays</h2>
              {application.essays && application.essays.length > 0 ? (
                <div className="space-y-3">
                  {application.essays.map((essay: any, index: number) => (
                    <div key={essay.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Essay {index + 1}</h3>
                        <span className="text-sm text-gray-600">{essay.wordCount} words</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {essay.promptText}
                      </p>
                      <Link
                        href={`/essay-generator?essayId=${essay.id}`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        View/Edit Essay →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No essays created yet</p>
                  <Link
                    href={`/essay-generator?scholarship=${scholarship.title}`}
                    className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Generate Essays
                  </Link>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Documents</h2>
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-2">
                  {application.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.type}</div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        View →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No documents uploaded yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">Scholarship Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Award Amount</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${scholarship.amount.toLocaleString()}
                  </div>
                </div>

                {deadline && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Deadline</div>
                    <div className="font-semibold">{deadline.toLocaleDateString()}</div>
                    {daysUntilDeadline !== null && (
                      <div
                        className={`text-sm mt-1 ${
                          daysUntilDeadline <= 7 ? 'text-red-600 font-semibold' : 'text-gray-600'
                        }`}
                      >
                        {daysUntilDeadline >= 0
                          ? `${daysUntilDeadline} days left`
                          : 'Deadline passed'}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500 mb-1">Created</div>
                  <div className="text-sm">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href={scholarship.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Open Application →
                </Link>

                <Link
                  href={`/scholarships/${scholarship.id}`}
                  className="block w-full text-center border-2 border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 font-semibold"
                >
                  View Scholarship
                </Link>

                <button
                  onClick={handleDelete}
                  className="block w-full text-center bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 font-semibold"
                >
                  Delete Application
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Checklist</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Review eligibility requirements</li>
                <li>✓ Write and polish essays</li>
                <li>✓ Gather recommendation letters</li>
                <li>✓ Upload required documents</li>
                <li>✓ Proofread everything</li>
                <li>✓ Submit before deadline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
