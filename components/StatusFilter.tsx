'use client';

interface StatusFilterProps {
  statuses: string[];
  selected: string;
  onSelect: (status: string) => void;
}

export default function StatusFilter({ statuses, selected, onSelect }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={() => onSelect('all')}
        className={`px-5 py-2.5 rounded-lg font-medium transition ${
          selected === 'all'
            ? 'bg-primary text-white'
            : 'bg-border text-text-secondary hover:bg-border/80'
        }`}
      >
        All Vehicles
      </button>
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onSelect(status)}
          className={`px-5 py-2.5 rounded-lg font-medium transition capitalize ${
            selected === status
              ? 'bg-primary text-white'
              : 'bg-border text-text-secondary hover:bg-border/80'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

