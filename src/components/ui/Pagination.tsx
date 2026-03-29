import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    { currentPage, totalPages, totalItems, itemsPerPage = 10, onPageChange, className, ...props },
    ref
  ) => {
    const handlePrevious = () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    };

    const handleNext = () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };

    // Calculate range of items displayed
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-gray-50 rounded-xl border border-gray-100',
          className
        )}
        {...props}
      >
        {/* Items info */}
        {totalItems && (
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> items
          </p>
        )}

        {/* Pagination buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page, and pages around current
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, pages) => {
                const showEllipsis = index > 0 && page - pages[index - 1] > 1;

                return (
                  <React.Fragment key={`page-${page}`}>
                    {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                    <button
                      onClick={() => onPageChange(page)}
                      className={cn(
                        'px-3 py-1 rounded-sm text-sm font-medium transition-colors duration-150',
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      )}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next →
          </Button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination };
export type { PaginationProps };
