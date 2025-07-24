import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isAfter, isToday, isThisWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Tag,
  Clock,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  GripVertical,
  Palette
} from 'lucide-react'
import { Task, TaskStatus } from '../types/task'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

const statusIcons = {
  pending: Clock,
  'in-progress': PlayCircle,
  completed: CheckCircle,
  cancelled: XCircle
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
}

const categoryLabels = {
  work: '💼 Trabajo',
  personal: '👤 Personal',
  shopping: '🛒 Compras',
  health: '🏥 Salud',
  education: '📚 Educación',
  other: '📝 Otro'
}

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
]

export function TaskCard({ task, onEdit, onDelete, onUpdate }: TaskCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const isOverdue = task.dueDate && isAfter(new Date(), task.dueDate) && task.status !== 'completed'
  const isDueToday = task.dueDate && isToday(task.dueDate)
  const isDueThisWeek = task.dueDate && isThisWeek(task.dueDate)

  const StatusIcon = statusIcons[task.status]

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdate(task.id, { status: newStatus })
  }

  const handleColorChange = (color: string) => {
    onUpdate(task.id, { color })
    setShowColorPicker(false)
  }

  const getDateColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-50'
    if (isDueToday) return 'text-orange-600 bg-orange-50'
    if (isDueThisWeek) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 group ${
        isDragging ? 'shadow-lg scale-105 rotate-2' : ''
      }`}
      style={{
        ...style,
        borderLeftColor: task.color || '#6366f1'
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowColorPicker(!showColorPicker)}>
                <Palette className="h-4 w-4 mr-2" />
                Cambiar color
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => handleStatusChange('pending')}
                disabled={task.status === 'pending'}
              >
                <Clock className="h-4 w-4 mr-2" />
                Marcar como pendiente
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusChange('in-progress')}
                disabled={task.status === 'in-progress'}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Marcar en progreso
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusChange('completed')}
                disabled={task.status === 'completed'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar completada
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusChange('cancelled')}
                disabled={task.status === 'cancelled'}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Marcar cancelada
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Color Picker */}
        {showColorPicker && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Seleccionar color:</p>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    task.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {/* Status Badge */}
          <Badge className={`${statusColors[task.status]} border`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {task.status === 'pending' && 'Pendiente'}
            {task.status === 'in-progress' && 'En Progreso'}
            {task.status === 'completed' && 'Completada'}
            {task.status === 'cancelled' && 'Cancelada'}
          </Badge>

          {/* Category */}
          <Badge variant="outline" className="text-gray-600">
            <Tag className="w-3 h-3 mr-1" />
            {categoryLabels[task.category]}
          </Badge>

          {/* Due Date */}
          {task.dueDate && (
            <Badge className={`${getDateColor()} border`}>
              <Calendar className="w-3 h-3 mr-1" />
              {format(task.dueDate, 'dd MMM', { locale: es })}
              {isOverdue && <AlertTriangle className="w-3 h-3 ml-1" />}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
          Creada {format(task.createdAt, 'dd/MM/yyyy HH:mm', { locale: es })}
        </div>
      </div>
    </div>
  )
}