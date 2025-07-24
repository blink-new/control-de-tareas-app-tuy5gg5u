import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Settings, Filter, Download, History, Users } from 'lucide-react';
import { Task, KanbanColumn, FilterOptions } from '../types';
import { KanbanColumn as KanbanColumnComponent } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { FilterPanel } from './FilterPanel';
import { SettingsPanel } from './SettingsPanel';
import { ExportPanel } from './ExportPanel';
import { HistoryPanel } from './HistoryPanel';
import { UsersPanel } from './UsersPanel';
import { useAppData } from '../hooks/useAppData';

interface KanbanBoardProps {
  tasks: Task[];
  columns: KanbanColumn[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  columns,
  filters,
  onFiltersChange
}) => {
  const {
    moveTask,
    updateTask,
    deleteTask,
    categories,
    statuses,
    users,
    backgrounds,
    changelog,
    settings
  } = useAppData();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    // Filtro de búsqueda
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Filtro de categorías
    if (filters.categories.length > 0 && !filters.categories.includes(task.categoryId)) {
      return false;
    }

    // Filtro de estados
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.statusId)) {
      return false;
    }

    // Filtro de usuarios asignados
    if (filters.assignedUsers.length > 0 && task.assignedTo && 
        !filters.assignedUsers.includes(task.assignedTo)) {
      return false;
    }

    // Filtro de prioridades
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
      return false;
    }

    // Filtro de rango de fechas
    if (filters.dateRange.start || filters.dateRange.end) {
      const taskDate = new Date(task.dueDate || task.createdAt);
      if (filters.dateRange.start && taskDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && taskDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    // Filtro de tareas vencidas
    if (filters.showOverdue && task.dueDate) {
      const isOverdue = new Date(task.dueDate) < new Date() && task.statusId !== 'completed';
      if (!isOverdue) return false;
    }

    // Filtro de tareas completadas
    if (!filters.showCompleted && task.statusId === 'completed') {
      return false;
    }

    return true;
  });

  // Agrupar tareas por columna
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.statusId] = filteredTasks
      .filter(task => task.statusId === column.statusId)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Si se mueve en la misma posición, no hacer nada
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      return;
    }

    const taskId = draggableId;
    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;

    // Mover tarea entre columnas o dentro de la misma columna
    if (sourceColumnId !== destColumnId) {
      // Cambiar estado de la tarea
      moveTask(taskId, destColumnId, destination.index);
    } else {
      // Reordenar dentro de la misma columna
      const columnTasks = tasksByColumn[sourceColumnId];
      const newOrder = destination.index;
      
      // Actualizar orden de las tareas
      const updatedTasks = [...columnTasks];
      const [movedTask] = updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, movedTask);

      // Actualizar orden en la base de datos
      updatedTasks.forEach((task, index) => {
        updateTask(task.id, { order: index });
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const getColumnStats = (columnId: string) => {
    const columnTasks = tasksByColumn[columnId] || [];
    const total = columnTasks.length;
    const overdue = columnTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.statusId !== 'completed'
    ).length;
    
    return { total, overdue };
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tablero Kanban</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredTasks.length} tareas • {columns.length} columnas
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
            
            <button
              onClick={() => setShowUsers(true)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </button>
            
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <History className="w-4 h-4 mr-2" />
              Historial
            </button>
            
            <button
              onClick={() => setShowExport(true)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </button>
            
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <FilterPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
              categories={categories}
              statuses={statuses}
              users={users}
            />
          </div>
        )}
      </div>

      {/* Tablero Kanban */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 min-w-max">
            {columns
              .sort((a, b) => a.order - b.order)
              .map(column => {
                const columnTasks = tasksByColumn[column.statusId] || [];
                const stats = getColumnStats(column.statusId);
                
                return (
                  <div key={column.id} className="w-80 flex-shrink-0">
                    <KanbanColumnComponent
                      column={column}
                      tasks={columnTasks}
                      stats={stats}
                      onEditTask={handleEditTask}
                      onDeleteTask={deleteTask}
                    />
                  </div>
                );
              })}
          </div>
        </DragDropContext>
      </div>

      {/* Modales */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseTaskForm}
          categories={categories}
          statuses={statuses}
          users={users}
          backgrounds={backgrounds}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
        />
      )}

      {showExport && (
        <ExportPanel
          tasks={filteredTasks}
          onClose={() => setShowExport(false)}
        />
      )}

      {showHistory && (
        <HistoryPanel
          changelog={changelog}
          tasks={tasks}
          users={users}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showUsers && (
        <UsersPanel
          onClose={() => setShowUsers(false)}
        />
      )}
    </div>
  );
};