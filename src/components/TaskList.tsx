import React from 'react'
import { Task, TaskStatus } from '../types/task'
import { TaskCard } from './TaskCard'
import { Button } from './ui/button'
import { 
  ListTodo, 
  Plus
} from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function TaskList({ tasks, onEdit, onDelete, onUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ListTodo className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay tareas
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          No se encontraron tareas que coincidan con los filtros actuales.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}