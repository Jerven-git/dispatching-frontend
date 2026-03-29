'use client';

import { useState } from 'react';
import { Card, Input } from '@/components/ui';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getPresetRange(preset: string): [string, string] {
  const today = new Date();
  const to = formatDate(today);

  switch (preset) {
    case 'today':
      return [to, to];
    case 'this_week': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return [formatDate(start), to];
    }
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return [formatDate(start), to];
    }
    case 'last_30': {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      return [formatDate(start), to];
    }
    case 'last_90': {
      const start = new Date(today);
      start.setDate(today.getDate() - 90);
      return [formatDate(start), to];
    }
    default:
      return [to, to];
  }
}

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last 30 Days', value: 'last_30' },
  { label: 'Last 90 Days', value: 'last_90' },
];

export default function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState('this_month');

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    const [newFrom, newTo] = getPresetRange(preset);
    onChange(newFrom, newTo);
  };

  const handleCustomChange = (field: 'from' | 'to', value: string) => {
    setActivePreset('');
    if (field === 'from') {
      onChange(value, to);
    } else {
      onChange(from, value);
    }
  };

  return (
    <Card padding="sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePreset(preset.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activePreset === preset.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={from}
            onChange={(e) => handleCustomChange('from', e.target.value)}
          />
          <span className="text-gray-400">to</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => handleCustomChange('to', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
