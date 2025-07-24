import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  User,
  Category,
  TaskStatus,
  BackgroundColor,
  KanbanColumn,
  ChangeLog,
  Alarm,
  AppSettings,
  FilterOptions
} from '../types';

const STORAGE_KEYS = {
  TASKS: 'kanban_tasks',
  USERS: 'kanban_users',
  CATEGORIES: 'kanban_categories',
  STATUSES: 'kanban_statuses',
  BACKGROUNDS: 'kanban_backgrounds',
  COLUMNS: 'kanban_columns',
  CHANGELOG: 'kanban_changelog',
  SETTINGS: 'kanban_settings'
};

// Datos iniciales
const defaultStatuses: TaskStatus[] = [
  {
    id: 'pending',
    name: 'Pendiente',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    order: 0,
    isDefault: true,
    canEdit: false,
    canDelete: false,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'in-progress',
    name: 'En Progreso',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    order: 1,
    isDefault: true,
    canEdit: false,
    canDelete: false,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'completed',
    name: 'Completada',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    order: 2,
    isDefault: true,
    canEdit: false,
    canDelete: false,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'cancelled',
    name: 'Cancelada',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    order: 3,
    isDefault: true,
    canEdit: false,
    canDelete: false,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

const defaultCategories: Category[] = [
  {
    id: 'work',
    name: 'Trabajo',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    icon: '💼',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    icon: '👤',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'shopping',
    name: 'Compras',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    icon: '🛒',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'health',
    name: 'Salud',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    icon: '🏥',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

const defaultUsers: User[] = [
  {
    id: 'current-user',
    name: 'Usuario Actual',
    email: 'usuario@ejemplo.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

const defaultBackgrounds: BackgroundColor[] = [
  { id: 'bg1', name: 'Blanco', color: '#ffffff', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg2', name: 'Azul Claro', color: '#dbeafe', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg3', name: 'Verde Claro', color: '#d1fae5', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg4', name: 'Amarillo Claro', color: '#fef3c7', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg5', name: 'Rosa Claro', color: '#fce7f3', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg6', name: 'Púrpura Claro', color: '#e9d5ff', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg7', name: 'Gradiente Azul', color: '#dbeafe', gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', createdAt: new Date().toISOString(), createdBy: 'system' },
  { id: 'bg8', name: 'Gradiente Verde', color: '#d1fae5', gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', createdAt: new Date().toISOString(), createdBy: 'system' }
];

export const useAppData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [statuses, setStatuses] = useState<TaskStatus[]>(defaultStatuses);
  const [backgrounds, setBackgrounds] = useState<BackgroundColor[]>(defaultBackgrounds);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [changelog, setChangelog] = useState<ChangeLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'es',
    notifications: true,
    autoSave: true,
    defaultView: 'kanban',
    columnsPerRow: 4,
    showCompletedTasks: true,
    taskCardSize: 'medium'
  });

  // Cargar datos del localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        const savedStatuses = localStorage.getItem(STORAGE_KEYS.STATUSES);
        const savedBackgrounds = localStorage.getItem(STORAGE_KEYS.BACKGROUNDS);
        const savedColumns = localStorage.getItem(STORAGE_KEYS.COLUMNS);
        const savedChangelog = localStorage.getItem(STORAGE_KEYS.CHANGELOG);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedUsers) setUsers(JSON.parse(savedUsers));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
        if (savedBackgrounds) setBackgrounds(JSON.parse(savedBackgrounds));
        if (savedChangelog) setChangelog(JSON.parse(savedChangelog));
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        // Crear columnas por defecto si no existen
        if (savedColumns) {
          setColumns(JSON.parse(savedColumns));
        } else {
          const defaultColumns = defaultStatuses.map((status, index) => ({
            id: `col-${status.id}`,
            statusId: status.id,
            title: status.name,
            color: status.color,
            backgroundColor: status.backgroundColor,
            order: index,
            isCollapsed: false
          }));
          setColumns(defaultColumns);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Guardar datos en localStorage
  const saveData = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
      localStorage.setItem(STORAGE_KEYS.BACKGROUNDS, JSON.stringify(backgrounds));
      localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
      localStorage.setItem(STORAGE_KEYS.CHANGELOG, JSON.stringify(changelog));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [tasks, users, categories, statuses, backgrounds, columns, changelog, settings]);

  // Auto-guardar
  useEffect(() => {
    if (settings.autoSave) {
      saveData();
    }
  }, [tasks, users, categories, statuses, backgrounds, columns, changelog, settings, saveData]);

  // Función para agregar al historial
  const addToChangelog = useCallback((entry: Omit<ChangeLog, 'id' | 'timestamp'>) => {
    const newEntry: ChangeLog = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setChangelog(prev => [newEntry, ...prev].slice(0, 1000)); // Mantener solo los últimos 1000 cambios
  }, []);

  // CRUD para tareas
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: tasks.length,
      alarms: []
    };

    setTasks(prev => [...prev, newTask]);
    addToChangelog({
      taskId: newTask.id,
      userId: 'current-user',
      action: 'created',
      description: `Tarea "${newTask.title}" creada`
    });

    return newTask;
  }, [tasks.length, addToChangelog]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        // Registrar cambios específicos
        Object.keys(updates).forEach(field => {
          if (task[field as keyof Task] !== updates[field as keyof Task]) {
            addToChangelog({
              taskId,
              userId: 'current-user',
              action: 'updated',
              field,
              oldValue: task[field as keyof Task],
              newValue: updates[field as keyof Task],
              description: `Campo "${field}" actualizado en tarea "${task.title}"`
            });
          }
        });

        return updatedTask;
      }
      return task;
    }));
  }, [addToChangelog]);

  const deleteTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToChangelog({
        taskId,
        userId: 'current-user',
        action: 'deleted',
        description: `Tarea "${task.title}" eliminada`
      });
    }
  }, [tasks, addToChangelog]);

  // CRUD para usuarios
  const createUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  // CRUD para categorías
  const createCategory = useCallback((categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((categoryId: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId ? { ...category, ...updates } : category
    ));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
  }, []);

  // CRUD para estados
  const createStatus = useCallback((statusData: Omit<TaskStatus, 'id' | 'createdAt'>) => {
    const newStatus: TaskStatus = {
      ...statusData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setStatuses(prev => [...prev, newStatus]);
    
    // Crear columna correspondiente
    const newColumn: KanbanColumn = {
      id: `col-${newStatus.id}`,
      statusId: newStatus.id,
      title: newStatus.name,
      color: newStatus.color,
      backgroundColor: newStatus.backgroundColor,
      order: columns.length,
      isCollapsed: false
    };
    setColumns(prev => [...prev, newColumn]);
    
    return newStatus;
  }, [columns.length]);

  const updateStatus = useCallback((statusId: string, updates: Partial<TaskStatus>) => {
    setStatuses(prev => prev.map(status => 
      status.id === statusId ? { ...status, ...updates } : status
    ));
    
    // Actualizar columna correspondiente
    setColumns(prev => prev.map(column => 
      column.statusId === statusId ? {
        ...column,
        title: updates.name || column.title,
        color: updates.color || column.color,
        backgroundColor: updates.backgroundColor || column.backgroundColor
      } : column
    ));
  }, []);

  const deleteStatus = useCallback((statusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    if (status && status.canDelete) {
      setStatuses(prev => prev.filter(status => status.id !== statusId));
      setColumns(prev => prev.filter(column => column.statusId !== statusId));
    }
  }, [statuses]);

  // CRUD para colores de fondo
  const createBackground = useCallback((backgroundData: Omit<BackgroundColor, 'id' | 'createdAt'>) => {
    const newBackground: BackgroundColor = {
      ...backgroundData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setBackgrounds(prev => [...prev, newBackground]);
    return newBackground;
  }, []);

  const updateBackground = useCallback((backgroundId: string, updates: Partial<BackgroundColor>) => {
    setBackgrounds(prev => prev.map(bg => 
      bg.id === backgroundId ? { ...bg, ...updates } : bg
    ));
  }, []);

  const deleteBackground = useCallback((backgroundId: string) => {
    setBackgrounds(prev => prev.filter(bg => bg.id !== backgroundId));
  }, []);

  // Funciones para alarmas
  const addAlarm = useCallback((taskId: string, alarmData: Omit<Alarm, 'id' | 'taskId' | 'createdAt'>) => {
    const newAlarm: Alarm = {
      ...alarmData,
      id: uuidv4(),
      taskId,
      createdAt: new Date().toISOString()
    };

    updateTask(taskId, {
      alarms: [...(tasks.find(t => t.id === taskId)?.alarms || []), newAlarm]
    });

    return newAlarm;
  }, [tasks, updateTask]);

  const removeAlarm = useCallback((taskId: string, alarmId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        alarms: task.alarms.filter(alarm => alarm.id !== alarmId)
      });
    }
  }, [tasks, updateTask]);

  // Función para mover tareas entre columnas
  const moveTask = useCallback((taskId: string, newStatusId: string, newOrder?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const oldStatus = statuses.find(s => s.id === task.statusId);
      const newStatus = statuses.find(s => s.id === newStatusId);
      
      updateTask(taskId, {
        statusId: newStatusId,
        order: newOrder ?? task.order
      });

      addToChangelog({
        taskId,
        userId: 'current-user',
        action: 'moved',
        oldValue: oldStatus?.name,
        newValue: newStatus?.name,
        description: `Tarea "${task.title}" movida de "${oldStatus?.name}" a "${newStatus?.name}"`
      });
    }
  }, [tasks, statuses, updateTask, addToChangelog]);

  return {
    // Estado
    tasks,
    users,
    categories,
    statuses,
    backgrounds,
    columns,
    changelog,
    settings,

    // CRUD Tareas
    createTask,
    updateTask,
    deleteTask,
    moveTask,

    // CRUD Usuarios
    createUser,
    updateUser,
    deleteUser,

    // CRUD Categorías
    createCategory,
    updateCategory,
    deleteCategory,

    // CRUD Estados
    createStatus,
    updateStatus,
    deleteStatus,

    // CRUD Colores de fondo
    createBackground,
    updateBackground,
    deleteBackground,

    // Alarmas
    addAlarm,
    removeAlarm,

    // Configuración
    setSettings,
    setColumns,

    // Utilidades
    saveData,
    addToChangelog
  };
};