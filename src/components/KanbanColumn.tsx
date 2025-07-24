import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { MoreVertical, Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Task, KanbanColumn as KanbanColumnType } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: Task[];
  stats: {
    total: number;
    overdue: number;
  };
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  stats,
  onEditTask,
  onDeleteTask
}) => {
  const [isCollapsed, setIsCollapsed] = useState(column.isCollapsed);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getColumnStyle = () => {
    if (column.backgroundColor) {
      return {
        background: column.backgroundColor,
        borderColor: column.color
      };
    }
    return {};
  };

  const getHeaderStyle = () => {
    return {
      backgroundColor: column.color,
      color: '#ffffff'
    };
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border-2 transition-all duration-200"
      style={getColumnStyle()}
    >
      {/* Header de la columna */}
      <div 
        className="p-4 rounded-t-lg"
        style={getHeaderStyle()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCollapse}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            <h3 className="font-semibold text-sm">{column.title}</h3>
            
            <div className="flex items-center gap-1">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {stats.total}
              </span>
              
              {stats.overdue > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.overdue}
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[150px]">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                  Editar columna
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                  Configurar límites
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                  Cambiar color
                </button>
                <hr className="my-1" />
                <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                  Eliminar columna
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Límite de tareas */}
        {column.maxTasks && (
          <div className="mt-2">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ 
                  width: `${Math.min((stats.total / column.maxTasks) * 100, 100)}%`,
                  backgroundColor: stats.total > column.maxTasks ? '#ef4444' : '#ffffff'
                }}
              />
            </div>
            <p className="text-xs mt-1 opacity-90">
              {stats.total} / {column.maxTasks} tareas
            </p>
          </div>
        )}
      </div>

      {/* Contenido de la columna */}
      {!isCollapsed && (
        <Droppable droppableId={column.statusId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-indigo-50' : ''
              }`}
            >
              {/* Botón para agregar tarea rápida */}
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors mb-4 group">
                <Plus className="w-4 h-4 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Agregar tarea</span>
              </button>

              {/* Lista de tareas */}
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-transform ${
                          snapshot.isDragging ? 'rotate-2 scale-105' : ''
                        }`}
                      >
                        <TaskCard
                          task={task}
                          onEdit={() => onEditTask(task)}
                          onDelete={() => onDeleteTask(task.id)}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>

              {provided.placeholder}

              {/* Estado vacío */}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="text-sm">No hay tareas en esta columna</p>
                  <p className="text-xs mt-1">Arrastra una tarea aquí o crea una nueva</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      )}

      {/* Columna colapsada */}
      {isCollapsed && (
        <div className="p-4">
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-gray-500">
              {stats.total} tarea{stats.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};