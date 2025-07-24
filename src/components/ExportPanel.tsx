import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Code } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Task, ExportOptions } from '../types';
import { useAppData } from '../hooks/useAppData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportPanelProps {
  tasks: Task[];
  onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ tasks, onClose }) => {
  const { categories, users, statuses, changelog } = useAppData();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeHistory: false,
    includeAttachments: false,
    filters: {
      search: '',
      categories: [],
      statuses: [],
      assignedUsers: [],
      priorities: [],
      dateRange: {},
      tags: [],
      showOverdue: false,
      showCompleted: true
    }
  });

  const [isExporting, setIsExporting] = useState(false);

  // Funciones de preparación de datos
  const prepareTaskData = () => {
    return tasks.map(task => {
      const category = categories.find(c => c.id === task.categoryId);
      const assignedUser = users.find(u => u.id === task.assignedTo);
      const status = statuses.find(s => s.id === task.statusId);
      const createdBy = users.find(u => u.id === task.createdBy);

      return {
        ID: task.id,
        Título: task.title,
        Descripción: task.description,
        Categoría: category?.name || 'Sin categoría',
        Estado: status?.name || 'Sin estado',
        'Asignado a': assignedUser?.name || 'Sin asignar',
        'Creado por': createdBy?.name || 'Desconocido',
        Prioridad: task.priority === 'urgent' ? 'Urgente' : 
                  task.priority === 'high' ? 'Alta' :
                  task.priority === 'medium' ? 'Media' :
                  task.priority === 'low' ? 'Baja' : 'Sin prioridad',
        'Fecha de vencimiento': task.dueDate ? format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Sin fecha',
        'Fecha de creación': format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }),
        'Última actualización': format(new Date(task.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es }),
        'Fecha de completado': task.completedAt ? format(new Date(task.completedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : '',
        Tags: task.tags?.join(', ') || '',
        'Número de alarmas': task.alarms?.length || 0,
        'Archivos adjuntos': task.attachments?.length || 0,
        Color: task.color,
        'Color de fondo': task.backgroundColor,
        Orden: task.order
      };
    });
  };

  const prepareHistoryData = () => {
    if (!exportOptions.includeHistory) return [];

    const taskIds = tasks.map(t => t.id);
    const relevantHistory = changelog.filter(entry => taskIds.includes(entry.taskId));

    return relevantHistory.map(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      const user = users.find(u => u.id === entry.userId);

      return {
        'ID del cambio': entry.id,
        'ID de la tarea': entry.taskId,
        'Título de la tarea': task?.title || 'Tarea eliminada',
        Usuario: user?.name || 'Usuario desconocido',
        Acción: entry.action === 'created' ? 'Creada' :
               entry.action === 'updated' ? 'Actualizada' :
               entry.action === 'deleted' ? 'Eliminada' :
               entry.action === 'moved' ? 'Movida' :
               entry.action === 'status_changed' ? 'Estado cambiado' : entry.action,
        Campo: entry.field || '',
        'Valor anterior': typeof entry.oldValue === 'object' ? JSON.stringify(entry.oldValue) : entry.oldValue || '',
        'Valor nuevo': typeof entry.newValue === 'object' ? JSON.stringify(entry.newValue) : entry.newValue || '',
        Descripción: entry.description,
        Fecha: format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es })
      };
    });
  };

  // Funciones de utilidad
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Funciones de exportación
  const exportToExcel = async () => {
    const workbook = XLSX.utils.book_new();

    // Hoja de tareas
    const taskData = prepareTaskData();
    const taskSheet = XLSX.utils.json_to_sheet(taskData);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tareas');

    // Hoja de historial (si está habilitado)
    if (exportOptions.includeHistory) {
      const historyData = prepareHistoryData();
      if (historyData.length > 0) {
        const historySheet = XLSX.utils.json_to_sheet(historyData);
        XLSX.utils.book_append_sheet(workbook, historySheet, 'Historial');
      }
    }

    // Hoja de resumen
    const summaryData = [
      { Métrica: 'Total de tareas', Valor: tasks.length },
      { Métrica: 'Tareas pendientes', Valor: tasks.filter(t => t.statusId === 'pending').length },
      { Métrica: 'Tareas en progreso', Valor: tasks.filter(t => t.statusId === 'in-progress').length },
      { Métrica: 'Tareas completadas', Valor: tasks.filter(t => t.statusId === 'completed').length },
      { Métrica: 'Tareas canceladas', Valor: tasks.filter(t => t.statusId === 'cancelled').length },
      { Métrica: 'Tareas vencidas', Valor: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.statusId !== 'completed').length },
      { Métrica: 'Fecha de exportación', Valor: format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es }) }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Descargar archivo
    const fileName = `tareas_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToCSV = async () => {
    const taskData = prepareTaskData();
    const csv = convertToCSV(taskData);
    downloadFile(csv, `tareas_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`, 'text/csv');
  };

  const exportToJSON = async () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalTasks: tasks.length,
        includeHistory: exportOptions.includeHistory,
        includeAttachments: exportOptions.includeAttachments
      },
      tasks: prepareTaskData(),
      history: exportOptions.includeHistory ? prepareHistoryData() : [],
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color,
        backgroundColor: c.backgroundColor,
        icon: c.icon
      })),
      statuses: statuses.map(s => ({
        id: s.id,
        name: s.name,
        color: s.color,
        backgroundColor: s.backgroundColor,
        order: s.order
      })),
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }))
    };

    const json = JSON.stringify(exportData, null, 2);
    downloadFile(json, `tareas_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`, 'application/json');
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (exportOptions.format) {
        case 'excel':
          await exportToExcel();
          break;
        case 'csv':
          await exportToCSV();
          break;
        case 'json':
          await exportToJSON();
          break;
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel': return <FileSpreadsheet className="w-5 h-5" />;
      case 'csv': return <FileText className="w-5 h-5" />;
      case 'json': return <Code className="w-5 h-5" />;
      default: return <Download className="w-5 h-5" />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'excel': return 'Archivo Excel con múltiples hojas (tareas, historial, resumen)';
      case 'csv': return 'Archivo CSV compatible con Excel y Google Sheets';
      case 'json': return 'Archivo JSON con estructura completa de datos';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Exportar Datos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Exportar {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en diferentes formatos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Formato de exportación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato de exportación
            </label>
            <div className="space-y-3">
              {[
                { value: 'excel', label: 'Excel (.xlsx)', recommended: true },
                { value: 'csv', label: 'CSV (.csv)' },
                { value: 'json', label: 'JSON (.json)' }
              ].map(format => (
                <label key={format.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {getFormatIcon(format.value)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{format.label}</span>
                        {format.recommended && (
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getFormatDescription(format.value)}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Opciones adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Opciones adicionales
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeHistory}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeHistory: e.target.checked 
                  }))}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Incluir historial de cambios</span>
                  <p className="text-sm text-gray-600">
                    Exportar el registro completo de modificaciones de las tareas
                  </p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAttachments}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeAttachments: e.target.checked 
                  }))}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Incluir información de archivos adjuntos</span>
                  <p className="text-sm text-gray-600">
                    Incluir metadatos de archivos adjuntos (no los archivos en sí)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Resumen de exportación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Resumen de exportación</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tareas a exportar:</span>
                <span className="font-medium ml-2">{tasks.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Formato:</span>
                <span className="font-medium ml-2 uppercase">{exportOptions.format}</span>
              </div>
              <div>
                <span className="text-gray-600">Incluir historial:</span>
                <span className="font-medium ml-2">{exportOptions.includeHistory ? 'Sí' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium ml-2">
                  {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};