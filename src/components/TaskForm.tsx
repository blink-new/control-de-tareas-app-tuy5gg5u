import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, Flag, Bell, Palette, Plus } from 'lucide-react';
import { Task, Category, TaskStatus, User as UserType, BackgroundColor } from '../types';
import { useAppData } from '../hooks/useAppData';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  categories: Category[];
  statuses: TaskStatus[];
  users: UserType[];
  backgrounds: BackgroundColor[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onClose,
  categories,
  statuses,
  users,
  backgrounds
}) => {
  const { createTask, updateTask, addAlarm } = useAppData();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || '',
    statusId: 'pending',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
    color: '#6366f1',
    backgroundColor: backgrounds[0]?.id || 'bg1',
    tags: [] as string[],
    attachments: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [alarmSettings, setAlarmSettings] = useState({
    enabled: false,
    type: 'before' as 'before' | 'at' | 'after',
    time: 15,
    message: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        categoryId: task.categoryId,
        statusId: task.statusId,
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority,
        color: task.color,
        backgroundColor: task.backgroundColor,
        tags: task.tags || [],
        attachments: task.attachments || []
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      createdBy: 'current-user'
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      const newTask = createTask(taskData);
      
      // Agregar alarma si está habilitada
      if (alarmSettings.enabled && formData.dueDate) {
        addAlarm(newTask.id, {
          type: alarmSettings.type,
          time: alarmSettings.time,
          message: alarmSettings.message || `Recordatorio: ${formData.title}`,
          isActive: true
        });
      }
    }

    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const selectedBackground = backgrounds.find(bg => bg.id === formData.backgroundColor);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Título de la tarea"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción de la tarea"
            />
          </div>

          {/* Fila 1: Categoría, Estado, Usuario asignado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.statusId}
                onChange={(e) => setFormData(prev => ({ ...prev, statusId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Asignado a
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Sin asignar</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Fecha de vencimiento, Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color del borde
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Fondo de la tarjeta
              </label>
              <select
                value={formData.backgroundColor}
                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {backgrounds.map(bg => (
                  <option key={bg.id} value={bg.id}>
                    {bg.name}
                  </option>
                ))}
              </select>
              {selectedBackground && (
                <div 
                  className="mt-2 w-full h-8 rounded border"
                  style={{ 
                    background: selectedBackground.gradient || selectedBackground.color 
                  }}
                />
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Agregar etiqueta"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alarmas (solo para tareas nuevas con fecha) */}
          {!task && formData.dueDate && (
            <div>
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={alarmSettings.enabled}
                  onChange={(e) => setAlarmSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-2"
                />
                <Bell className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium text-gray-700">Configurar alarma</span>
              </label>

              {alarmSettings.enabled && (
                <div className="ml-6 space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tipo
                      </label>
                      <select
                        value={alarmSettings.type}
                        onChange={(e) => setAlarmSettings(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'before' | 'at' | 'after' 
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="before">Antes</option>
                        <option value="at">En el momento</option>
                        <option value="after">Después</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tiempo (minutos)
                      </label>
                      <input
                        type="number"
                        value={alarmSettings.time}
                        onChange={(e) => setAlarmSettings(prev => ({ 
                          ...prev, 
                          time: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Mensaje personalizado
                    </label>
                    <input
                      type="text"
                      value={alarmSettings.message}
                      onChange={(e) => setAlarmSettings(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder={`Recordatorio: ${formData.title}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {task ? 'Actualizar' : 'Crear'} Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};