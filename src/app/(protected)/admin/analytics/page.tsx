'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
} from '@/components/ui';
import type {
  RevenueTrendItem,
  ServicePopularityItem,
  CustomerLifetimeValueItem,
  JobProfitabilityItem,
  ProfitabilitySummary,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function getDefaultRange(): [string, string] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  return [start.toISOString().split('T')[0], today.toISOString().split('T')[0]];
}

export default function AnalyticsPage() {
  const [defaultFrom, defaultTo] = getDefaultRange();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [loading, setLoading] = useState(true);

  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [servicePopularity, setServicePopularity] = useState<ServicePopularityItem[]>([]);
  const [customerLtv, setCustomerLtv] = useState<CustomerLifetimeValueItem[]>([]);
  const [profitability, setProfitability] = useState<JobProfitabilityItem[]>([]);
  const [profitSummary, setProfitSummary] = useState<ProfitabilitySummary | null>(null);

  const fetchAll = useCallback((f: string, t: string) => {
    setLoading(true);
    const params = { from: f, to: t };

    Promise.all([
      api.get<{ data: RevenueTrendItem[] }>('/analytics/revenue-trend', params),
      api.get<{ data: ServicePopularityItem[] }>('/analytics/service-popularity', params),
      api.get<{ data: CustomerLifetimeValueItem[] }>('/analytics/customer-lifetime-value', params),
      api.get<{ data: JobProfitabilityItem[]; summary: ProfitabilitySummary }>(
        '/analytics/job-profitability',
        params
      ),
    ])
      .then(([revenueRes, serviceRes, customerRes, profitRes]) => {
        setRevenueTrend(revenueRes.data);
        setServicePopularity(serviceRes.data);
        setCustomerLtv(customerRes.data);
        setProfitability(profitRes.data);
        setProfitSummary(profitRes.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll(from, to);
  }, [from, to, fetchAll]);

  const handleExport = (type: string) => {
    window.open(`${BASE_URL}/api/export/${type}?from=${from}&to=${to}`, '_blank');
  };

  const maxRevenue = revenueTrend.length > 0 ? Math.max(...revenueTrend.map((r) => r.revenue)) : 1;
  const maxServiceJobs =
    servicePopularity.length > 0 ? Math.max(...servicePopularity.map((s) => s.total_jobs)) : 1;

  const SERVICE_COLORS = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-orange-500',
    'bg-teal-500',
  ];

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Business intelligence and performance metrics"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => handleExport('jobs')}>
              Export Jobs CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('invoices')}>
              Export Invoices CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('customers')}>
              Export Customers CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('technician-performance')}>
              Export Technician Performance CSV
            </Button>
          </div>
        }
      />

      {/* Date Range Filter */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const [df, dt] = getDefaultRange();
              setFrom(df);
              setTo(dt);
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="h-48 rounded-lg bg-gray-200 animate-pulse" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Trend */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
            {revenueTrend.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No revenue data for this period.</p>
            ) : (
              <div className="flex items-end gap-2 h-56">
                {revenueTrend.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center min-w-0">
                    <span className="text-xs text-gray-500 mb-1 truncate w-full text-center">
                      ${item.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                    <div
                      className="w-full bg-indigo-500 rounded-t transition-all duration-300 min-h-[4px]"
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {item.month}
                    </span>
                    <span className="text-xs text-gray-400 truncate w-full text-center">
                      {item.jobs_completed} jobs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Service Popularity */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Popularity</h2>
            {servicePopularity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No service data for this period.</p>
            ) : (
              <div className="space-y-3">
                {servicePopularity.map((item, idx) => (
                  <div key={item.service.id} className="flex items-center gap-4">
                    <div className="w-40 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700 truncate block">
                        {item.service.name}
                      </span>
                    </div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${SERVICE_COLORS[idx % SERVICE_COLORS.length]} rounded-lg transition-all duration-300`}
                        style={{ width: `${(item.total_jobs / maxServiceJobs) * 100}%` }}
                      />
                    </div>
                    <div className="w-28 flex-shrink-0 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.total_jobs} jobs
                      </span>
                    </div>
                    <div className="w-28 flex-shrink-0 text-right">
                      <span className="text-sm text-gray-500">
                        ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Customer Lifetime Value */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value</h2>
            {customerLtv.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No customer data for this period.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Jobs</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead className="text-right">Avg Job Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerLtv.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-gray-600">{c.email || '-'}</TableCell>
                      <TableCell className="text-right">{c.total_jobs}</TableCell>
                      <TableCell className="text-right">
                        ${c.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${c.total_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${c.avg_job_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Job Profitability */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Profitability</h2>

            {/* Summary Cards */}
            {profitSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Total Revenue</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    ${profitSummary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Total Parts Cost</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    ${profitSummary.total_parts_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Total Labor Revenue</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    ${profitSummary.total_labor_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Avg Profit Margin</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {profitSummary.avg_profit_margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {profitability.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No profitability data for this period.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Parts Cost</TableHead>
                    <TableHead className="text-right">Labor Revenue</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitability.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium text-indigo-600">
                        {job.reference_number}
                      </TableCell>
                      <TableCell className="text-gray-700">{job.customer}</TableCell>
                      <TableCell className="text-gray-700">{job.service}</TableCell>
                      <TableCell className="text-right">
                        ${job.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        ${job.parts_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${job.labor_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            job.profit_margin >= 50
                              ? 'success'
                              : job.profit_margin >= 20
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {job.profit_margin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
