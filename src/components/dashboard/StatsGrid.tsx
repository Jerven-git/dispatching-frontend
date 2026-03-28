'use client';

interface StatCard {
  label: string;
  value: number;
  color: string;
}

interface StatsGridProps {
  stats: StatCard[];
  loading?: boolean;
}

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((card) => (
        <div key={card.label} className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="mt-1 text-3xl font-bold">{card.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full ${card.color} opacity-20`} />
          </div>
        </div>
      ))}
    </div>
  );
}
