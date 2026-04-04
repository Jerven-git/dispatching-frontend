'use client';

import { useState, type ReactNode } from 'react';
import JobAttachments from './JobAttachments';
import JobChecklist from './JobChecklist';
import JobComments from './JobComments';

interface JobTabsProps {
  jobId: number;
  canEdit: boolean;
  children: ReactNode;
}

const tabs = ['Details', 'Attachments', 'Checklist', 'Comments'] as const;
type Tab = (typeof tabs)[number];

export default function JobTabs({ jobId, canEdit, children }: JobTabsProps) {
  const [active, setActive] = useState<Tab>('Details');

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
                active === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {active === 'Details' && children}
      {active === 'Attachments' && <JobAttachments jobId={jobId} canEdit={canEdit} />}
      {active === 'Checklist' && <JobChecklist jobId={jobId} canEdit={canEdit} />}
      {active === 'Comments' && <JobComments jobId={jobId} canEdit={canEdit} />}
    </div>
  );
}
