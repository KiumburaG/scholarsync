'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { SCHOLARSHIP_MATCH_QUERY } from '@/lib/graphql/queries';
import { CREATE_APPLICATION_MUTATION } from '@/lib/graphql/mutations';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scholarshipId = params.id as string;

  const [creatingApp, setCreatingApp] = useState(false);

  const { data, loading, error } = useQuery(SCHOLARSHIP_MATCH_QUERY, {
    variables: { scholarshipId },
  });

  const [createApplication] = useMutation(CREATE_APPLICATION_MUTATION, {
    onCompleted: (data) => {
      router.push(`/applications/${data.createApplication.id}`);
    },
    onError: (error) => {
      alert(error.message);
      setCreatingApp(false);
    },
  });

  const handleStartApplication = async () => {
    setCreatingApp(true);
    await createApplication({ variables: { scholarshipId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.scholarshipMatch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Scholarship not found'}
          </p>
          <Link
            href="/scholarships"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Scholarships
          </Link>
        </div>
      </div>
    );
  }

  const { scholarship, matchScore, eligibilityStatus, missingRequirements, matchFactors } =
    data.scholarshipMatch;

  const deadline = new Date(scholarship.deadline);
  const daysUntilDeadline = Math.floor(
    (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const eligibility = scholarship.eligibilityRequirements as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/scholarships"
            className="inline-flex items-center text-purple-100 hover:text-white mb-4"
          >
            ← Back to Scholarships
          </Link>
          <h1 className="text-4xl font-bold mb-2">{scholarship.title}</h1>
          <p className="text-purple-100 text-lg">{scholarship.organization}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Match Score Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Match Score</h2>
              <p className="text-gray-600">
                This scholarship is a{' '}
                {matchScore >= 80
                  ? 'excellent'
                  : matchScore >= 60
                  ? 'good'
                  : 'moderate'}{' '}
                match for your profile
              </p>
            </div>
            <div className="text-center">
              <div
                className={`text-5xl font-bold px-6 py-4 rounded-lg ${
                  matchScore >= 80
                    ? 'text-green-600 bg-green-50'
                    : matchScore >= 60
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-gray-600 bg-gray-50'
                }`}
              >
                {matchScore}%
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    eligibilityStatus === 'eligible'
                      ? 'bg-green-100 text-green-800'
                      : eligibilityStatus === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {eligibilityStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Match Factors */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <MatchFactor label="GPA Match" value={matchFactors.gpaMatch} />
            <MatchFactor label="Major Match" value={matchFactors.majorMatch} />
            <MatchFactor label="Academic Standing" value={matchFactors.academicStandingMatch} />
            <MatchFactor label="Deadline Timing" value={matchFactors.deadlineProximity} />
            <MatchFactor label="Profile Strength" value={matchFactors.profileStrength} />
            <MatchFactor label="Activity Match" value={matchFactors.activityMatch} />
          </div>

          {/* Missing Requirements */}
          {missingRequirements.length > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Missing Requirements:</h3>
              <ul className="list-disc list-inside space-y-1">
                {missingRequirements.map((req: string, index: number) => (
                  <li key={index} className="text-yellow-800 text-sm">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
            </div>

            {/* Essay Prompts */}
            {scholarship.essayPrompts && scholarship.essayPrompts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Essay Requirements</h2>
                <div className="space-y-4">
                  {scholarship.essayPrompts.map((prompt: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Essay {index + 1}</h3>
                        <span className="text-sm text-gray-500">
                          {prompt.wordLimit ? `${prompt.wordLimit} words` : 'No limit'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{prompt.prompt}</p>
                      <Link
                        href={`/essay-generator?prompt=${encodeURIComponent(
                          prompt.prompt
                        )}&limit=${prompt.wordLimit || 500}&scholarship=${scholarship.title}`}
                        className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Generate with AI →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Eligibility Requirements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {eligibility.minGPA && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm text-gray-500">Minimum GPA</div>
                    <div className="font-semibold">{eligibility.minGPA}</div>
                  </div>
                )}

                {eligibility.academicStanding && eligibility.academicStanding.length > 0 && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm text-gray-500">Academic Standing</div>
                    <div className="font-semibold">{eligibility.academicStanding.join(', ')}</div>
                  </div>
                )}

                {eligibility.majors && eligibility.majors.length > 0 && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm text-gray-500">Eligible Majors</div>
                    <div className="font-semibold">{eligibility.majors.join(', ')}</div>
                  </div>
                )}

                {eligibility.citizenshipRequired !== undefined && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm text-gray-500">Citizenship</div>
                    <div className="font-semibold">
                      {eligibility.citizenshipRequired ? 'US Citizens Only' : 'Open to All'}
                    </div>
                  </div>
                )}

                {eligibility.essayRequired !== undefined && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm text-gray-500">Essay</div>
                    <div className="font-semibold">
                      {eligibility.essayRequired ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                )}

                {eligibility.recommendationsRequired !== undefined && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm text-gray-500">Recommendations</div>
                    <div className="font-semibold">
                      {eligibility.recommendationsRequired || 'None required'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">Key Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Award Amount</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${scholarship.amount.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Deadline</div>
                  <div className="font-semibold">{deadline.toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Expired'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Organization</div>
                  <div className="font-semibold">{scholarship.organization}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleStartApplication}
                  disabled={creatingApp}
                  className="block w-full text-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  {creatingApp ? 'Creating...' : '📝 Start Application'}
                </button>

                <a
                  href={scholarship.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Apply on Site →
                </a>

                <Link
                  href={`/essay-generator?scholarship=${scholarship.title}`}
                  className="block w-full text-center border-2 border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 font-semibold"
                >
                  Generate Essays
                </Link>
              </div>
            </div>

            {/* Tags */}
            {scholarship.tags && scholarship.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {scholarship.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Application Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Start your essays early</li>
                <li>• Review eligibility carefully</li>
                <li>• Gather recommendations in advance</li>
                <li>• Proofread everything</li>
                <li>• Submit before the deadline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchFactor({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = value >= 0.8 ? 'bg-green-500' : value >= 0.5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold">{percentage}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
