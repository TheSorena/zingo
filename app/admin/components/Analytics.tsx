import type { protos } from '@google-analytics/data';
type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

interface AnalyticsProps {
  data: RunReportResponse;
}

export function Analytics({ data }: AnalyticsProps) {
  const metrics = data.rows?.[0]?.metricValues ?? [];
  const stats = [
    { label: 'Page Views', value: metrics[0]?.value ?? '0' },
    { label: 'Sessions', value: metrics[1]?.value ?? '0' },
    { label: 'Unique Visitors', value: metrics[2]?.value ?? '0' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
          <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
        </div>
      ))}
    </div>
  );
} 