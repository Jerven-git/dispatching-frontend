'use client';

import { Card } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

interface StatCard {
  label: string;
  value: number;
  color: string;
  textColor: string;
  icon?: React.ReactNode;
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
          <div key={i} className="h-32 rounded-xl bg-white border border-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((card) => (
        <Card key={card.label} variant="default">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <button className="text-gray-300 hover:text-gray-400 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <p className={`mt-3 text-3xl font-bold ${card.textColor}`}>
            {card.value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-gray-400">vs. Previous month</p>
        </Card>
      ))}
    </div>
  );
}
