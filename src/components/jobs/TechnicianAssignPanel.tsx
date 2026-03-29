'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, Select, Button } from '@/components/ui';
import type { ServiceJob, TechnicianWorkload } from '@/types';

interface TechnicianAssignPanelProps {
  job: ServiceJob;
  onAssigned: (updatedJob: ServiceJob) => void;
}

export default function TechnicianAssignPanel({
  job,
  onAssigned,
}: TechnicianAssignPanelProps) {
  const [technicians, setTechnicians] = useState<TechnicianWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    job.technician ? String(job.technician.id) : ''
  );

  useEffect(() => {
    api
      .get<{ technicians: TechnicianWorkload[] }>('/technicians/workloads')
      .then((data) => setTechnicians(data.technicians))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    setAssigning(true);
    try {
      const data = await api.patch<{ job: ServiceJob }>(
        `/service-jobs/${job.id}/assign`,
        { technician_id: selectedId ? Number(selectedId) : null }
      );
      onAssigned(data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    setAssigning(true);
    try {
      const data = await api.patch<{ job: ServiceJob }>(
        `/service-jobs/${job.id}/assign`,
        { technician_id: null }
      );
      setSelectedId('');
      onAssigned(data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const isTerminal = job.status === 'completed' || job.status === 'cancelled';
  const currentTechId = job.technician ? String(job.technician.id) : '';
  const hasChanged = selectedId !== currentTechId;

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-10 rounded bg-gray-200" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Assign Technician</h2>

      {/* Current assignment */}
      {job.technician && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-blue-50 p-3">
          <div>
            <p className="text-sm font-medium text-blue-900">{job.technician.name}</p>
            <p className="text-xs text-blue-700">{job.technician.email}</p>
          </div>
          {!isTerminal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnassign}
              disabled={assigning}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              Unassign
            </Button>
          )}
        </div>
      )}

      {!isTerminal && (
        <>
          {/* Technician selector */}
          <div className="mb-3">
            <Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={assigning}
              placeholder="Select a technician"
              options={technicians.map((tech) => ({
                value: tech.id,
                label: `${tech.name} (${tech.active_jobs} active, ${tech.today_jobs} today)`,
              }))}
              fullWidth
            />
          </div>

          {/* Assign button */}
          {hasChanged && selectedId && (
            <Button
              variant="primary"
              fullWidth
              onClick={handleAssign}
              loading={assigning}
            >
              {job.technician ? 'Reassign' : 'Assign'}
            </Button>
          )}

          {/* Workload summary */}
          {technicians.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
                Workload Overview
              </h3>
              <div className="space-y-2">
                {technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                      String(tech.id) === selectedId
                        ? 'bg-blue-50 font-medium'
                        : ''
                    }`}
                  >
                    <span className="text-gray-700">{tech.name}</span>
                    <div className="flex gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 ${
                          tech.active_jobs === 0
                            ? 'bg-green-100 text-green-700'
                            : tech.active_jobs >= 5
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {tech.active_jobs} active
                      </span>
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-600">
                        {tech.today_jobs} today
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
