import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  totalLabel?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, totalItems, totalLabel }) => {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage > 3) {
        pages.push(1, '...');
      } else {
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
          pages.push(i);
        }
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...', totalPages);
      } else {
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (!pages.includes(i)) {
            pages.push(i);
          }
        }
      }
    }
    return pages;
  };

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &laquo;
      </button>
      {getPages().map((page, index) => (
        <button
          key={index}
          disabled={page === '...'}
          className={page === currentPage ? 'active' : ''}
          onClick={() => typeof page === 'number' && onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &raquo;
      </button>
      {typeof totalItems === 'number' && (
        <span className="pagination-total-items">{totalLabel || 'Total'}: {totalItems}</span>
      )}
    </div>
  );
};

export default Pagination;