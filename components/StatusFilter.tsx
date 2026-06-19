'use client';

interface StatusFilterProps {
  statuses: string[];
  selected: string;
  onSelect: (status: string) => void;
}

export default function StatusFilter({ statuses, selected, onSelect }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition active:scale-95 whitespace-nowrap min-h-[40px] sm:min-h-auto ${
          selected === 'all'
            ? 'bg-primary text-white shadow-lg'
            : 'bg-border text-text-secondary hover:bg-border/80'
        }`}
      >
        All Vehicles
      </button>
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onSelect(status)}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition active:scale-95 whitespace-nowrap capitalize min-h-[40px] sm:min-h-auto ${
            selected === status
              ? 'bg-primary text-white shadow-lg'
              : 'bg-border text-text-secondary hover:bg-border/80'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

