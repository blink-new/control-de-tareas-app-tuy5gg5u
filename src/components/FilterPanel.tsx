import React from 'react';
import { Search, X, Calendar, User, Tag, Flag } from 'lucide-react';
import { FilterOptions, Category, TaskStatus, User as UserType } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Category[];
  statuses: TaskStatus[];
  users: UserType[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  categories,
  statuses,
  users
}) => {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'categories' | 'statuses' | 'assignedUsers' | 'priorities' | 'tags', value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
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
  };

  const hasActiveFilters = () => {
    return filters.search ||
           filters.categories.length > 0 ||
           filters.statuses.length > 0 ||
           filters.assignedUsers.length > 0 ||
           filters.priorities.length > 0 ||
           filters.dateRange.start ||
           filters.dateRange.end ||
           filters.tags.length > 0 ||
           filters.showOverdue ||
           !filters.showCompleted;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Buscar
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Categorías */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Categorías
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {categories.map(category => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => toggleArrayFilter('categories', category.id)}
                  className="mr-2"
                />
                <span 
                  className="text-xs px-2 py-1 rounded-full mr-2"
                  style={{ 
                    backgroundColor: category.backgroundColor,
                    color: category.color 
                  }}
                >
                  {category.icon}
                </span>
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Estados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estados
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {statuses.map(status => (
              <label key={status.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status.id)}
                  onChange={() => toggleArrayFilter('statuses', status.id)}
                  className="mr-2"
                />
                <span 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm">{status.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Usuarios asignados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Asignado a
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {users.map(user => (
              <label key={user.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.assignedUsers.includes(user.id)}
                  onChange={() => toggleArrayFilter('assignedUsers', user.id)}
                  className="mr-2"
                />
                <span className="text-sm">{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Prioridades */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Flag className="w-4 h-4 inline mr-1" />
            Prioridad
          </label>
          <div className="space-y-1">
            {[
              { value: 'urgent', label: 'Urgente', color: 'bg-red-500' },
              { value: 'high', label: 'Alta', color: 'bg-orange-500' },
              { value: 'medium', label: 'Media', color: 'bg-yellow-500' },
              { value: 'low', label: 'Baja', color: 'bg-green-500' }
            ].map(priority => (
              <label key={priority.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.priorities.includes(priority.value)}
                  onChange={() => toggleArrayFilter('priorities', priority.value)}
                  className="mr-2"
                />
                <span className={`w-3 h-3 rounded-full mr-2 ${priority.color}`} />
                <span className="text-sm">{priority.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rango de fechas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Rango de fechas
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => updateFilter('dateRange', { 
                ...filters.dateRange, 
                start: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Fecha inicio"
            />
            <input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => updateFilter('dateRange', { 
                ...filters.dateRange, 
                end: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Fecha fin"
            />
          </div>
        </div>

        {/* Filtros especiales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtros especiales
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showOverdue}
                onChange={(e) => updateFilter('showOverdue', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Solo vencidas</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showCompleted}
                onChange={(e) => updateFilter('showCompleted', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Mostrar completadas</span>
            </label>
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {hasActiveFilters() && (
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-700 font-medium mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                Búsqueda: "{filters.search}"
              </span>
            )}
            {filters.categories.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                {filters.categories.length} categoría{filters.categories.length !== 1 ? 's' : ''}
              </span>
            )}
            {filters.statuses.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                {filters.statuses.length} estado{filters.statuses.length !== 1 ? 's' : ''}
              </span>
            )}
            {filters.assignedUsers.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                {filters.assignedUsers.length} usuario{filters.assignedUsers.length !== 1 ? 's' : ''}
              </span>
            )}
            {filters.priorities.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                {filters.priorities.length} prioridad{filters.priorities.length !== 1 ? 'es' : ''}
              </span>
            )}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                Rango de fechas
              </span>
            )}
            {filters.showOverdue && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                Solo vencidas
              </span>
            )}
            {!filters.showCompleted && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                Sin completadas
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};