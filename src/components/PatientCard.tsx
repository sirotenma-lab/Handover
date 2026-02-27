import React from 'react';
import { User, Bed, ChevronRight, Activity } from 'lucide-react';
import { Patient } from '../types';
import { cn } from '../lib/utils';

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left transition-all duration-200 group",
        "p-4 rounded-2xl border mb-3",
        isSelected 
          ? "bg-blue-50 border-blue-200 shadow-sm" 
          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          )}>
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{patient.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Bed size={14} /> {patient.room} - {patient.bed}
              </span>
              <span>•</span>
              <span>{patient.age} th ({patient.gender})</span>
            </div>
          </div>
        </div>
        <ChevronRight size={20} className={cn(
          "transition-transform",
          isSelected ? "text-blue-500 translate-x-1" : "text-slate-300"
        )} />
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Activity size={14} className="text-blue-500" />
          <span className="truncate max-w-[180px]">{patient.diagnosis}</span>
        </div>
        {patient.lastHandover && (
          <span className="text-[10px] text-slate-400">
            Terakhir: {new Date(patient.lastHandover.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </button>
  );
};
