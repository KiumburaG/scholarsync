'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  MY_APPLICATIONS_QUERY,
  APPLICATION_STATS_QUERY,
} from '@/lib/graphql/queries';
import {
  UPDATE_APPLICATION_MUTATION,
  DELETE_APPLICATION_MUTATION,
  UPDATE_APPLICATION_PROGRESS_MUTATION,
} from '@/lib/graphql/mutations';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, loading, error, refetch } = useQuery(MY_APPLICATIONS_QUERY, {
    variables: { status: statusFilter || undefined, limit: 50 },
  });

  const { data: statsData } = useQuery(APPLICATION_STATS_QUERY);

  const [deleteApplication] = useMutation(DELETE_APPLICATION_MUTATION, {
    onCompleted: () => refetch(),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const applications = data?.myApplications || [];
  const stats = statsData?.applicationStats || null;

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      await deleteApplication({ variables: { id } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">My Applications</h1>
          <p className="text-purple-100 text-lg">
            Track your scholarship applications and manage deadlines
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} color="text-gray-900" />
            <StatCard label="In Progress" value={stats.inProgress} color="text-blue-600" />
            <StatCard label="Submitted" value={stats.submitted} color="text-purple-600" />
            <StatCard label="Accepted" value={stats.accepted} color="text-green-600" />
            <StatCard
              label="Amount Won"
              value={`$${stats.totalAmountWon.toLocaleString()}`}
              color="text-green-600"
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              active={statusFilter === ''}
              onClick={() => setStatusFilter('')}
            />
            <FilterButton
              label="Draft"
              active={statusFilter === 'DRAFT'}
              onClick={() => setStatusFilter('DRAFT')}
            />
            <FilterButton
              label="In Progress"
              active={statusFilter === 'IN_PROGRESS'}
              onClick={() => setStatusFilter('IN_PROGRESS')}
            />
            <FilterButton
              label="Submitted"
              active={statusFilter === 'SUBMITTED'}
              onClick={() => setStatusFilter('SUBMITTED')}
            />
            <FilterButton
              label="Pending"
              active={statusFilter === 'PENDING'}
              onClick={() => setStatusFilter('PENDING')}
            />
            <FilterButton
              label="Accepted"
              active={statusFilter === 'ACCEPTED'}
              onClick={() => setStatusFilter('ACCEPTED')}
            />
            <FilterButton
              label="Rejected"
              active={statusFilter === 'REJECTED'}
              onClick={() => setStatusFilter('REJECTED')}
            />
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">
              Start applying to scholarships to track them here.
            </p>
            <Link
              href="/scholarships"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Browse Scholarships
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onDelete={handleDelete}
                onUpdate={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function ApplicationCard({
  application,
  onDelete,
  onUpdate,
}: {
  application: any;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}) {
  const [updateProgress] = useMutation(UPDATE_APPLICATION_PROGRESS_MUTATION, {
    onCompleted: onUpdate,
  });

  const deadline = application.deadline ? new Date(application.deadline) : null;
  const daysUntilDeadline = deadline
    ? Math.floor((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleProgressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseInt(e.target.value);
    await updateProgress({
      variables: {
        id: application.id,
        percentage,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={`/applications/${application.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-purple-600"
          >
            {application.scholarship.title}
          </Link>
          <p className="text-gray-600 mt-1">{application.scholarship.organization}</p>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              statusColors[application.status as keyof typeof statusColors]
            }`}
          >
            {application.status.replace('_', ' ')}
          </span>
          {application.amountAwarded && (
            <span className="text-lg font-bold text-green-600">
              ${application.amountAwarded.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Award Amount</div>
          <div className="text-lg font-semibold text-gray-900">
            ${application.scholarship.amount.toLocaleString()}
          </div>
        </div>

        {deadline && (
          <div>
            <div className="text-sm text-gray-500">Deadline</div>
            <div className="text-lg font-semibold text-gray-900">
              {daysUntilDeadline !== null && daysUntilDeadline >= 0 ? (
                <span className={daysUntilDeadline <= 7 ? 'text-red-600' : ''}>
                  {daysUntilDeadline} days
                </span>
              ) : (
                <span className="text-red-600">Passed</span>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-gray-500">Essays</div>
          <div className="text-lg font-semibold text-gray-900">
            {application.essays?.length || 0}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-lg font-semibold text-gray-900">
            {application.progressPercentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className="text-sm text-gray-600">{application.progressPercentage}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={application.progressPercentage}
          onChange={handleProgressChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/applications/${application.id}`}
          className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm"
        >
          View Details
        </Link>
        <Link
          href={`/scholarships/${application.scholarshipId}`}
          className="flex-1 text-center bg-white border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 font-medium text-sm"
        >
          View Scholarship
        </Link>
        <button
          onClick={() => onDelete(application.id)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
