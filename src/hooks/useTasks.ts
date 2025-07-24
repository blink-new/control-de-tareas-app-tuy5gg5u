import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskCategory, TaskFilters } from '../types/task';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'tasks-app-data';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    category: 'all',
    date: 'all',
    search: ''
  });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      order: tasks.length
    };
    setTasks(prev => [...prev, newTask]);
    toast.success('Tarea creada exitosamente');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
    toast.success('Tarea actualizada');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success('Tarea eliminada');
  };

  const reorderTasks = (newTasks: Task[]) => {
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index,
      updatedAt: new Date()
    }));
    setTasks(reorderedTasks);
  };

  const getFilteredTasks = () => {
    return tasks
      .filter(task => {
        // Status filter
        if (filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && task.category !== filters.category) {
          return false;
        }

        // Date filter
        if (filters.date !== 'all' && task.dueDate) {
          const today = new Date();
          const taskDate = new Date(task.dueDate);
          
          switch (filters.date) {
            case 'today':
              if (taskDate.toDateString() !== today.toDateString()) {
                return false;
              }
              break;
            case 'week': {
              const weekFromNow = new Date();
              weekFromNow.setDate(today.getDate() + 7);
              if (taskDate > weekFromNow) {
                return false;
              }
              break;
            }
            case 'overdue':
              if (taskDate >= today || task.status === 'completed') {
                return false;
              }
              break;
          }
        } else if (filters.date === 'overdue' && !task.dueDate) {
          return false;
        }

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!task.title.toLowerCase().includes(searchLower) && 
              !task.description?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.order - b.order);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total, pending, inProgress, completed, cancelled, overdue };
  };

  return {
    tasks: getFilteredTasks(),
    allTasks: tasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    stats: getTaskStats()
  };
}