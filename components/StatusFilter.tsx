'use client';

interface StatusFilterProps {
  statuses: string[];
  selected: string;
  onSelect: (status: string) => void;
}

export default function StatusFilter({ statuses, selected, onSelect }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          selected === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        All Vehicles
      </button>
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onSelect(status)}
          className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
            selected === status
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

