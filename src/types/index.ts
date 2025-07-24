export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  icon?: string;
  createdAt: string;
  createdBy: string;
}

export interface TaskStatus {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  order: number;
  isDefault: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  createdBy: string;
}

export interface BackgroundColor {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  createdAt: string;
  createdBy: string;
}

export interface Alarm {
  id: string;
  taskId: string;
  type: 'before' | 'at' | 'after';
  time: number; // minutes
  message: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChangeLog {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'moved' | 'status_changed';
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  statusId: string;
  assignedTo?: string;
  createdBy: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  backgroundColor: string;
  tags: string[];
  attachments: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  alarms: Alarm[];
}

export interface KanbanColumn {
  id: string;
  statusId: string;
  title: string;
  color: string;
  backgroundColor: string;
  order: number;
  isCollapsed: boolean;
  maxTasks?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  notifications: boolean;
  autoSave: boolean;
  defaultView: 'kanban' | 'list' | 'calendar';
  columnsPerRow: number;
  showCompletedTasks: boolean;
  taskCardSize: 'small' | 'medium' | 'large';
}

export interface FilterOptions {
  search: string;
  categories: string[];
  statuses: string[];
  assignedUsers: string[];
  priorities: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  tags: string[];
  showOverdue: boolean;
  showCompleted: boolean;
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'json';
  includeHistory: boolean;
  includeAttachments: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters: FilterOptions;
}