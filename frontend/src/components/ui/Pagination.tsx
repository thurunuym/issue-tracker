import React from 'react';
import Button from './Button';
import cn from '../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-150 dark:border-gray-800', className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-750 dark:text-gray-400">
            Showing Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              className="rounded-r-none"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>

            {pages.map((p) => (
              <Button
                key={p}
                variant={currentPage === p ? 'primary' : 'outline'}
                size="sm"
                className="rounded-none border-x-0 cursor-pointer min-w-[36px]"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="rounded-l-none"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
