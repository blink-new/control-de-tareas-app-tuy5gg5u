export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'education' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: Date;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export type DateFilter = 'all' | 'today' | 'week' | 'overdue';

export interface TaskFilters {
  status: TaskStatus | 'all';
  category: TaskCategory | 'all';
  date: DateFilter;
  search: string;
}