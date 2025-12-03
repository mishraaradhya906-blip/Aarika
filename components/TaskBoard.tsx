import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Trash2, Calendar, ClipboardList } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onComplete, onDelete }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-lg">My Tasks</h2>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
          {pendingTasks.length} Pending
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Pending Tasks */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">To Do</h3>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
              <p className="text-slate-400 text-sm">No pending tasks.</p>
              <p className="text-slate-300 text-xs mt-1">Ask Aarika to add one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div key={task.id} className="group flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all bg-white">
                  <button onClick={() => onComplete(task.id)} className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors">
                    <Circle size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 font-medium text-sm truncate">{task.title}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Completed</h3>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 opacity-75">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <p className="flex-1 text-slate-500 text-sm line-through truncate">{task.title}</p>
                  <button onClick={() => onDelete(task.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <Calendar size={12} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default TaskBoard;
