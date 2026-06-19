'use client';

interface SortBarProps {
  sortBy: 'date' | 'rating-asc' | 'rating-desc';
  onSortChange: (sortBy: 'date' | 'rating-asc' | 'rating-desc') => void;
  disabled?: boolean;
}

export default function SortBar({ sortBy, onSortChange, disabled = false }: SortBarProps) {
  const sortOptions = [
    { value: 'date' as const, label: 'Most Recent' },
    { value: 'rating-asc' as const, label: 'Rating: Low to High' },
    { value: 'rating-desc' as const, label: 'Rating: High to Low' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <span className={`text-sm font-medium ${disabled ? 'text-text-secondary' : 'text-foreground'}`}>Sort by:</span>
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && onSortChange(option.value)}
            disabled={disabled}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition active:scale-95 whitespace-nowrap min-h-[40px] sm:min-h-auto ${
              disabled
                ? 'bg-border/50 text-text-secondary/50 cursor-not-allowed'
                : sortBy === option.value
                ? 'bg-primary text-white shadow-lg'
                : 'bg-border text-text-secondary hover:bg-border/80'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
