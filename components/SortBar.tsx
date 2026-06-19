'use client';

interface SortBarProps {
  sortBy: 'date' | 'rating-asc' | 'rating-desc';
  onSortChange: (sortBy: 'date' | 'rating-asc' | 'rating-desc') => void;
}

export default function SortBar({ sortBy, onSortChange }: SortBarProps) {
  const sortOptions = [
    { value: 'date' as const, label: 'Most Recent' },
    { value: 'rating-asc' as const, label: 'Rating: Low to High' },
    { value: 'rating-desc' as const, label: 'Rating: High to Low' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <span className="text-sm font-medium text-foreground">Sort by:</span>
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition active:scale-95 whitespace-nowrap min-h-[40px] sm:min-h-auto ${
              sortBy === option.value
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
