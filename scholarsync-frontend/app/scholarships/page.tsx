'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { MATCHED_SCHOLARSHIPS_QUERY, SCHOLARSHIP_TAGS_QUERY } from '@/lib/graphql/queries';
import Link from 'next/link';

export default function ScholarshipsPage() {
  const [minScore, setMinScore] = useState(60);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [view, setView] = useState<'matched' | 'all'>('matched');

  const { data, loading, error } = useQuery(MATCHED_SCHOLARSHIPS_QUERY, {
    variables: { limit: 20, minScore },
    skip: view === 'all',
  });

  const { data: tagsData } = useQuery(SCHOLARSHIP_TAGS_QUERY);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scholarships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Scholarships</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          {error.message.includes('Profile') && (
            <Link
              href="/onboarding"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Complete Your Profile
            </Link>
          )}
        </div>
      </div>
    );
  }

  const matches = data?.matchedScholarships || [];
  const tags = tagsData?.scholarshipTags || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Scholarship Opportunities</h1>
          <p className="text-purple-100 text-lg">
            Personalized scholarship matches based on your profile
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>

              {/* View Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('matched')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                      view === 'matched'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Matched
                  </button>
                  <button
                    onClick={() => setView('all')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                      view === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Minimum Score Filter */}
              {view === 'matched' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Match Score: {minScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tags.map((tag: string) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTags([]);
                  setMinScore(60);
                }}
                className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {matches.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold mb-2">No Scholarships Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or complete more of your profile to see better matches.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {matches.length} scholarship{matches.length !== 1 ? 's' : ''} matching your profile
                </div>

                <div className="space-y-4">
                  {matches.map((match: any) => (
                    <ScholarshipCard key={match.scholarship.id} match={match} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScholarshipCard({ match }: { match: any }) {
  const { scholarship, matchScore, eligibilityStatus, matchFactors } = match;
  const deadline = new Date(scholarship.deadline);
  const daysUntilDeadline = Math.floor(
    (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status: string) => {
    if (status === 'eligible') return 'bg-green-100 text-green-800';
    if (status === 'partial') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={`/scholarships/${scholarship.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-purple-600"
          >
            {scholarship.title}
          </Link>
          <p className="text-gray-600 mt-1">{scholarship.organization}</p>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <div
            className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(matchScore)}`}
          >
            {matchScore}%
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(eligibilityStatus)}`}>
            {eligibilityStatus}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{scholarship.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Award Amount</div>
          <div className="text-lg font-semibold text-gray-900">
            ${scholarship.amount.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Deadline</div>
          <div className="text-lg font-semibold text-gray-900">
            {daysUntilDeadline} days
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Essays Required</div>
          <div className="text-lg font-semibold text-gray-900">
            {scholarship.essayPrompts?.length || 0}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Categories</div>
          <div className="flex gap-1 flex-wrap mt-1">
            {scholarship.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {scholarship.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{scholarship.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>

      {/* Match Factors */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Match Breakdown</div>
        <div className="grid grid-cols-3 gap-2">
          <FactorBar label="GPA" value={matchFactors.gpaMatch} />
          <FactorBar label="Major" value={matchFactors.majorMatch} />
          <FactorBar label="Activities" value={matchFactors.activityMatch} />
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/scholarships/${scholarship.id}`}
          className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
        >
          View Details
        </Link>
        <a
          href={scholarship.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-white border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 font-medium"
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}

function FactorBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = value >= 0.8 ? 'bg-green-500' : value >= 0.5 ? 'bg-yellow-500' : 'bg-gray-300';

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
