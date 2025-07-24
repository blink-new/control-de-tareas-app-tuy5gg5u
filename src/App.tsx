import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { useAppData } from './hooks/useAppData';
import { FilterOptions } from './types';

function App() {
  const { tasks, columns } = useAppData();
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    categories: [],
    statuses: [],
    assignedUsers: [],
    priorities: [],
    dateRange: {},
    tags: [],
    showOverdue: false,
    showCompleted: true
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <KanbanBoard
        tasks={tasks}
        columns={columns}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}

export default App;