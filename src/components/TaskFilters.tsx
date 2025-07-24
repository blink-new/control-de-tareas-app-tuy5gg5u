import { TaskFilters, TaskStatus, TaskCategory, DateFilter } from '../types/task';
import { Input } from './ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Search, 
  Filter, 
  X,
  Calendar,
  Tag,
  CheckCircle
} from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  taskStats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
}

const statusOptions = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const categoryOptions = [
  { value: 'all', label: 'Todas las Categorías' },
  { value: 'work', label: 'Trabajo' },
  { value: 'personal', label: 'Personal' },
  { value: 'shopping', label: 'Compras' },
  { value: 'health', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'other', label: 'Otro' }
];

const dateOptions = [
  { value: 'all', label: 'Todas las Fechas' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'overdue', label: 'Vencidas' }
];

export function TaskFilters({ filters, onFiltersChange, taskStats }: TaskFiltersProps) {
  const hasActiveFilters = filters.status !== 'all' || 
                          filters.category !== 'all' || 
                          filters.date !== 'all' || 
                          filters.search !== '';

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      date: 'all',
      search: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.status} 
            onValueChange={(value: TaskStatus | 'all') => 
              onFiltersChange({ ...filters, status: value })
            }
          >
            <SelectTrigger>
              <CheckCircle className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.category} 
            onValueChange={(value: TaskCategory | 'all') => 
              onFiltersChange({ ...filters, category: value })
            }
          >
            <SelectTrigger>
              <Tag className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.date} 
            onValueChange={(value: DateFilter) => 
              onFiltersChange({ ...filters, date: value })
            }
          >
            <SelectTrigger>
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="shrink-0"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              <Search className="w-3 h-3" />
              "{filters.search}"
              <button 
                onClick={() => onFiltersChange({ ...filters, search: '' })}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {statusOptions.find(s => s.value === filters.status)?.label}
              <button 
                onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              <Tag className="w-3 h-3" />
              {categoryOptions.find(c => c.value === filters.category)?.label}
              <button 
                onClick={() => onFiltersChange({ ...filters, category: 'all' })}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.date !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {dateOptions.find(d => d.value === filters.date)?.label}
              <button 
                onClick={() => onFiltersChange({ ...filters, date: 'all' })}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg p-3 border text-center">
          <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg p-3 border text-center">
          <div className="text-2xl font-bold text-gray-600">{taskStats.pending}</div>
          <div className="text-xs text-gray-500">Pendientes</div>
        </div>
        <div className="bg-white rounded-lg p-3 border text-center">
          <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
          <div className="text-xs text-gray-500">En Progreso</div>
        </div>
        <div className="bg-white rounded-lg p-3 border text-center">
          <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          <div className="text-xs text-gray-500">Completadas</div>
        </div>
        <div className="bg-white rounded-lg p-3 border text-center">
          <div className="text-2xl font-bold text-red-600">{taskStats.cancelled}</div>
          <div className="text-xs text-gray-500">Canceladas</div>
        </div>
        <div className="bg-white rounded-lg p-3 border text-center">
          <div className="text-2xl font-bold text-orange-600">{taskStats.overdue}</div>
          <div className="text-xs text-gray-500">Vencidas</div>
        </div>
      </div>
    </div>
  );
}