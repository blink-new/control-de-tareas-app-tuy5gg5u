import React from 'react';
import { X } from 'lucide-react';
import { ChangeLog, Task, User } from '../types';

interface HistoryPanelProps {
  changelog: ChangeLog[];
  tasks: Task[];
  users: User[];
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  changelog, 
  tasks, 
  users, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Cambios</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Historial de cambios en desarrollo...</p>
          <p className="text-sm text-gray-500 mt-2">
            {changelog.length} entradas en el historial
          </p>
        </div>
      </div>
    </div>
  );
};