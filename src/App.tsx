import React, { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useTasks } from './hooks/useTasks'
import { TaskForm } from './components/TaskForm'
import { TaskFilters } from './components/TaskFilters'
import { TaskList } from './components/TaskList'
import { Task, TaskStatus, TaskCategory } from './types/task'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { CheckCircle, Clock, AlertCircle, XCircle, Plus, Download, Upload } from 'lucide-react'

function App() {
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    status: 'all' as TaskStatus | 'all',
    category: 'all' as TaskCategory | 'all',
    dateFilter: 'all' as 'all' | 'today' | 'week' | 'overdue',
    search: ''
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filters.status === 'all' || task.status === filters.status
    const matchesCategory = filters.category === 'all' || task.category === filters.category
    const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         task.description.toLowerCase().includes(filters.search.toLowerCase())
    
    let matchesDate = true
    if (filters.dateFilter !== 'all' && task.dueDate) {
      const today = new Date()
      const dueDate = new Date(task.dueDate)
      
      switch (filters.dateFilter) {
        case 'today':
          matchesDate = dueDate.toDateString() === today.toDateString()
          break
        case 'week': {
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          matchesDate = dueDate <= weekFromNow && dueDate >= today
          break
        }
        case 'overdue':
          matchesDate = dueDate < today && task.status !== 'completed'
          break
      }
    }
    
    return matchesStatus && matchesCategory && matchesSearch && matchesDate
  })

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex(task => task.id === active.id)
      const newIndex = filteredTasks.findIndex(task => task.id === over.id)
      
      const newOrder = arrayMove(filteredTasks, oldIndex, newIndex)
      reorderTasks(newOrder)
    }
  }

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(taskData)
    setShowForm(false)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
      setEditingTask(null)
      setShowForm(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setShowForm(false)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `tareas-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target?.result as string)
          // Aquí podrías agregar validación de los datos importados
          localStorage.setItem('tasks', JSON.stringify(importedTasks))
          window.location.reload()
        } catch (error) {
          alert('Error al importar el archivo. Asegúrate de que sea un archivo JSON válido.')
        }
      }
      reader.readAsText(file)
    }
  }

  const getStatusStats = () => {
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    }
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Control de Tareas</h1>
          <p className="text-slate-600">Gestiona tus tareas de manera eficiente y organizada</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">En Progreso</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Completadas</p>
                  <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Canceladas</p>
                  <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
          
          <Button 
            variant="outline" 
            onClick={exportData}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button 
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskForm
                  task={editingTask}
                  onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Tareas ({filteredTasks.length})
              </CardTitle>
              {filteredTasks.length > 0 && (
                <Badge variant="secondary">
                  {filteredTasks.length} de {tasks.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={filteredTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditTask}
                  onDelete={deleteTask}
                  onUpdate={updateTask}
                />
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App