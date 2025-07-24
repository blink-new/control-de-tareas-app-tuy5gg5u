import React, { useState } from 'react';
import { format, isAfter, isBefore, isToday, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  Bell,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive,
  Flag,
  Paperclip
} from 'lucide-react';
import { Task, Category, User as UserType, TaskStatus, BackgroundColor } from '../types';
import { useAppData } from '../hooks/useAppData';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  isDragging = false
}) => {
  const { categories, users, statuses, backgrounds, updateTask } = useAppData();
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const category = categories.find(c => c.id === task.categoryId);
  const assignedUser = users.find(u => u.id === task.assignedTo);
  const status = statuses.find(s => s.id === task.statusId);
  const background = backgrounds.find(b => b.id === task.backgroundColor);

  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.statusId !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const isDueThisWeek = task.dueDate && isThisWeek(new Date(task.dueDate));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const getDateColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-50';
    if (isDueToday) return 'text-orange-600 bg-orange-50';
    if (isDueThisWeek) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleColorChange = (colorId: string) => {
    updateTask(task.id, { backgroundColor: colorId });
    setShowColorPicker(false);
  };

  const handleStatusChange = (statusId: string) => {
    updateTask(task.id, { statusId });
    setShowMenu(false);
  };

  const handlePriorityChange = (priority: string) => {
    updateTask(task.id, { priority: priority as Task['priority'] });
    setShowMenu(false);
  };

  const getCardStyle = () => {
    const baseStyle: React.CSSProperties = {
      background: background?.gradient || background?.color || task.backgroundColor || '#ffffff',
      borderColor: task.color || category?.color || '#e5e7eb'
    };

    if (isDragging) {
      baseStyle.transform = 'rotate(2deg) scale(1.05)';
      baseStyle.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    }

    return baseStyle;
  };

  return (
    <div
      className="bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      style={getCardStyle()}
      onClick={onEdit}
    >
      {/* Header de la tarjeta */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[180px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: task.backgroundColor }} />
                  Cambiar color
                </button>

                {/* Cambiar estado */}
                <div className="px-3 py-1">
                  <p className="text-xs text-gray-500 mb-1">Cambiar estado:</p>
                  {statuses.map(s => (
                    <button
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(s.id);
                      }}
                      className={`w-full px-2 py-1 text-left text-xs rounded mb-1 ${
                        s.id === task.statusId ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {/* Cambiar prioridad */}
                <div className="px-3 py-1">
                  <p className="text-xs text-gray-500 mb-1">Cambiar prioridad:</p>
                  {['urgent', 'high', 'medium', 'low'].map(priority => (
                    <button
                      key={priority}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePriorityChange(priority);
                      }}
                      className={`w-full px-2 py-1 text-left text-xs rounded mb-1 flex items-center gap-2 ${
                        priority === task.priority ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
                      {getPriorityLabel(priority)}
                    </button>
                  ))}
                </div>

                <hr className="my-1" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${task.title}\n${task.description}`);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadatos de la tarea */}
        <div className="space-y-2">
          {/* Categoría */}
          {category && (
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 text-gray-400" />
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: category.backgroundColor,
                  color: category.color 
                }}
              >
                {category.icon} {category.name}
              </span>
            </div>
          )}

          {/* Usuario asignado */}
          {assignedUser && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {assignedUser.name}
              </span>
            </div>
          )}

          {/* Fecha de vencimiento */}
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className={`text-xs px-2 py-1 rounded ${getDateColor()}`}>
                {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}
                {isOverdue && <AlertTriangle className="w-3 h-3 ml-1 inline" />}
              </span>
            </div>
          )}

          {/* Prioridad */}
          <div className="flex items-center gap-2">
            <Flag className="w-3 h-3 text-gray-400" />
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
              <span className="text-xs text-gray-600">
                {getPriorityLabel(task.priority)}
              </span>
            </div>
          </div>

          {/* Alarmas */}
          {task.alarms && task.alarms.length > 0 && (
            <div className="flex items-center gap-2">
              <Bell className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {task.alarms.length} alarma{task.alarms.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Archivos adjuntos */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Paperclip className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {task.attachments.length} archivo{task.attachments.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tiempo transcurrido */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Creada {format(new Date(task.createdAt), 'dd/MM/yyyy', { locale: es })}
            </span>
            {task.updatedAt !== task.createdAt && (
              <span>
                Actualizada {format(new Date(task.updatedAt), 'dd/MM/yyyy', { locale: es })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selector de colores */}
      {showColorPicker && (
        <div className="absolute top-0 left-0 right-0 bg-white border rounded-lg shadow-lg p-3 z-30">
          <p className="text-sm font-medium mb-2">Seleccionar color de fondo:</p>
          <div className="grid grid-cols-4 gap-2">
            {backgrounds.map(bg => (
              <button
                key={bg.id}
                onClick={() => handleColorChange(bg.id)}
                className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                style={{ 
                  background: bg.gradient || bg.color,
                  borderColor: bg.id === task.backgroundColor ? '#4f46e5' : '#e5e7eb'
                }}
                title={bg.name}
              />
            ))}
          </div>
          <button
            onClick={() => setShowColorPicker(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};