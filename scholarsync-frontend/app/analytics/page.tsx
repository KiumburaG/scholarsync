'use client';

import { useQuery } from '@apollo/client';
import {
  APPLICATION_TIMELINE_QUERY,
  SUCCESS_ANALYTICS_QUERY,
  ACTIVITY_ANALYTICS_QUERY,
  UPCOMING_DEADLINES_QUERY,
  FINANCIAL_SUMMARY_QUERY,
} from '@/lib/graphql/queries';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const { data: timelineData, loading: timelineLoading } = useQuery(
    APPLICATION_TIMELINE_QUERY,
    { variables: { months: 6 } }
  );

  const { data: successData, loading: successLoading } = useQuery(SUCCESS_ANALYTICS_QUERY);
  const { data: activityData, loading: activityLoading } = useQuery(ACTIVITY_ANALYTICS_QUERY);
  const { data: deadlinesData, loading: deadlinesLoading } = useQuery(UPCOMING_DEADLINES_QUERY, {
    variables: { days: 14 },
  });
  const { data: financialData, loading: financialLoading } = useQuery(FINANCIAL_SUMMARY_QUERY);

  const loading =
    timelineLoading ||
    successLoading ||
    activityLoading ||
    deadlinesLoading ||
    financialLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const timeline = timelineData?.applicationTimeline || [];
  const success = successData?.successAnalytics;
  const activity = activityData?.activityAnalytics;
  const deadlines = deadlinesData?.upcomingDeadlines || [];
  const financial = financialData?.financialSummary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-purple-100 text-lg">
            Track your scholarship application performance and insights
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Success Rate"
            value={`${Math.round(success?.successRate || 0)}%`}
            color="text-green-600"
            icon="✓"
          />
          <MetricCard
            label="Completion Rate"
            value={`${Math.round(success?.completionRate || 0)}%`}
            color="text-blue-600"
            icon="📊"
          />
          <MetricCard
            label="Current Streak"
            value={`${activity?.currentStreak || 0} days`}
            color="text-orange-600"
            icon="🔥"
          />
          <MetricCard
            label="Total Won"
            value={`$${(financial?.totalWon || 0).toLocaleString()}`}
            color="text-green-600"
            icon="💰"
          />
        </div>

        {/* Timeline Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Timeline (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length > 0 ? (
              <TimelineChart data={timeline} />
            ) : (
              <p className="text-gray-600 text-center py-8">
                No application data yet. Start applying to see your timeline!
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Success Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="space-y-4">
                  <ProgressBar
                    label="Submitted"
                    value={success.submitted}
                    total={success.totalApplications}
                    color="bg-blue-500"
                  />
                  <ProgressBar
                    label="Accepted"
                    value={success.accepted}
                    total={success.submitted || 1}
                    color="bg-green-500"
                  />
                  <ProgressBar
                    label="Rejected"
                    value={success.rejected}
                    total={success.submitted || 1}
                    color="bg-red-500"
                  />
                  <ProgressBar
                    label="Pending"
                    value={success.pending}
                    total={success.submitted || 1}
                    color="bg-yellow-500"
                  />

                  <div className="pt-4 border-t mt-4">
                    <div className="text-sm text-gray-600 mb-1">Avg. Time to Submit</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(success.avgTimeToSubmit)} days
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {activity && (
                <div className="space-y-4">
                  <StatRow label="Total Applications" value={activity.totalApplications} />
                  <StatRow label="Total Essays" value={activity.totalEssays} />
                  <StatRow label="Recent Applications (30d)" value={activity.recentApplications} />
                  <StatRow label="Recent Essays (30d)" value={activity.recentEssays} />

                  <div className="pt-4 border-t mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Current Streak</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {activity.currentStreak} 🔥
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {activity.longestStreak} 🏆
                        </div>
                      </div>
                    </div>
                  </div>

                  {activity.mostActiveDay && (
                    <div className="pt-4">
                      <div className="text-sm text-gray-600 mb-1">Most Active Day</div>
                      <div className="font-semibold">
                        {activity.mostActiveDay} ({activity.mostActiveDayCount} activities)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {financial && (
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Applied For</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${financial.totalAppliedFor.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Won</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${financial.totalWon.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Pending Amount</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${financial.pending.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg. Award Won</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${Math.round(financial.averageAwardWon).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {success && success.categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {success.categoryBreakdown.slice(0, 5).map((cat: any) => (
                    <div key={cat.category} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-sm text-gray-600">
                          {cat.accepted}/{cat.total}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-full transition-all"
                            style={{ width: `${cat.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {Math.round(cat.successRate)}%
                        </span>
                      </div>
                      {cat.wonAmount > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Won: ${cat.wonAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No category data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines (Next 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {deadlines.length > 0 ? (
                <div className="space-y-3">
                  {deadlines.map((deadline: any) => (
                    <Link
                      key={deadline.applicationId}
                      href={`/applications/${deadline.applicationId}`}
                      className="block border rounded-lg p-3 hover:border-purple-500 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">{deadline.scholarshipTitle}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            deadline.daysRemaining <= 3
                              ? 'bg-red-100 text-red-700'
                              : deadline.daysRemaining <= 7
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {deadline.daysRemaining} days
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full"
                            style={{ width: `${deadline.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {deadline.progressPercentage}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No upcoming deadlines in the next 14 days
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Keep Up the Great Work!</h3>
          <p className="text-gray-700 mb-6">
            Continue applying to scholarships to improve your success rate and win more awards.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/scholarships"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
            >
              Browse Scholarships
            </Link>
            <Link
              href="/applications"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold border-2 border-purple-600"
            >
              View Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function TimelineChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.started, d.submitted, d.accepted)));

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Submitted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Accepted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Rejected</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.map((month) => (
          <div key={month.month} className="space-y-1">
            <div className="text-sm font-medium text-gray-700">{month.month}</div>
            <div className="flex gap-1">
              {month.started > 0 && (
                <div
                  className="bg-blue-500 h-8 rounded flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(month.started / maxValue) * 100}%` }}
                  title={`Started: ${month.started}`}
                >
                  {month.started}
                </div>
              )}
              {month.submitted > 0 && (
                <div
                  className="bg-purple-500 h-8 rounded flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(month.submitted / maxValue) * 100}%` }}
                  title={`Submitted: ${month.submitted}`}
                >
                  {month.submitted}
                </div>
              )}
              {month.accepted > 0 && (
                <div
                  className="bg-green-500 h-8 rounded flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(month.accepted / maxValue) * 100}%` }}
                  title={`Accepted: ${month.accepted}`}
                >
                  {month.accepted}
                </div>
              )}
              {month.rejected > 0 && (
                <div
                  className="bg-red-500 h-8 rounded flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(month.rejected / maxValue) * 100}%` }}
                  title={`Rejected: ${month.rejected}`}
                >
                  {month.rejected}
                </div>
              )}
            </div>
            {month.wonAmount > 0 && (
              <div className="text-xs text-green-600 font-semibold">
                Won: ${month.wonAmount.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">
          {value} / {total} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-lg">{value}</span>
    </div>
  );
}
