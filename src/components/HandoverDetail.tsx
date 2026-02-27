import React, { useState } from 'react';
import { ClipboardList, Stethoscope, CheckSquare, Info, AlertCircle, Droplets, Thermometer, Wind, Activity, FileSpreadsheet, ExternalLink, Loader2, Printer } from 'lucide-react';
import { Patient, Handover } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HandoverDetailProps {
  patient: Patient;
}

export const HandoverDetail: React.FC<HandoverDetailProps> = ({ patient }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const handover = patient.lastHandover;

  const handlePrint = () => {
    window.print();
  };

  const handleSyncToSheets = async () => {
    if (!handover) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handover, patient })
      });
      const data = await res.json();
      if (data.success) {
        setSheetUrl(data.url);
      } else {
        alert(data.error || 'Gagal sinkronisasi');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat sinkronisasi');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!handover) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
        <ClipboardList size={48} className="mb-4 opacity-20" />
        <p>Belum ada data handover untuk pasien ini.</p>
        <button className="mt-4 btn-primary">Buat Handover Baru</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Print Header */}
      <div className="print-header">
        <h1 className="text-2xl font-bold">FORM SERAH TERIMA PASIEN (HANDOVER)</h1>
        <p className="text-sm">Rumah Sakit Digital Handover</p>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
          <p className="text-slate-500">{patient.diagnosis}</p>
          
          <div className="mt-4 flex flex-wrap gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              <Printer size={16} />
              Cetak Form
            </button>
            <button 
              onClick={handleSyncToSheets}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold border border-emerald-100 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              Export ke Google Sheets
            </button>
            {sheetUrl && (
              <a 
                href={sheetUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <ExternalLink size={16} />
                Buka Spreadsheet
              </a>
            )}
          </div>
        </div>
        <div className="text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Handover</p>
          <p className="font-medium text-slate-700">{handover.nurseInCharge} → {handover.nurseNextShift}</p>
          <p className="text-xs text-slate-400">{new Date(handover.timestamp).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* SBAR Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <ClipboardList size={20} className="text-blue-600" />
          <h3>Metode SBAR</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SBARCard title="Situation" content={handover.sbar.situation} color="bg-blue-50 text-blue-700 border-blue-100" />
          <SBARCard title="Background" content={handover.sbar.background} color="bg-slate-50 text-slate-700 border-slate-100" />
          <SBARCard title="Assessment" content={handover.sbar.assessment} color="bg-amber-50 text-amber-700 border-amber-100" />
          <SBARCard title="Recommendation" content={handover.sbar.recommendation} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="input-label flex items-center gap-2">
              <Activity size={14} /> Instruksi Medis Terbaru
            </label>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {handover.sbar.latestMedicalInstructions}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label flex items-center gap-2 text-red-600">
                <AlertCircle size={14} /> Hasil Penunjang Kritis
              </label>
              <p className="text-slate-700 bg-red-50 p-3 rounded-xl border border-red-100">
                {handover.sbar.criticalResults}
              </p>
            </div>
            <div>
              <label className="input-label flex items-center gap-2">
                <Info size={14} /> Kondisi Alat Kesehatan
              </label>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {handover.sbar.medicalDeviceStatus}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Exam Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <Stethoscope size={20} className="text-blue-600" />
          <h3>Pemeriksaan Fisik Cepat</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
              <Droplets size={16} /> Cairan Infus
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-slate-400">Jenis:</span> {handover.physicalExam.infusion.type}</p>
              <p><span className="text-slate-400">Sisa:</span> {handover.physicalExam.infusion.remainingVolume}</p>
              <p><span className="text-slate-400">Tetesan:</span> {handover.physicalExam.infusion.dripRate}</p>
            </div>
          </div>

          <div className="card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
              <Thermometer size={16} /> Luka / Balutan
            </div>
            <p className="text-sm text-slate-700">{handover.physicalExam.wounds}</p>
          </div>

          <div className="card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              <Wind size={16} /> Alat Bantu
            </div>
            <div className="flex flex-wrap gap-2">
              {handover.physicalExam.assistiveDevices.oxygen && <Badge label="Oksigen" />}
              {handover.physicalExam.assistiveDevices.catheter && <Badge label="Kateter" />}
              {handover.physicalExam.assistiveDevices.ngt && <Badge label="NGT" />}
              {handover.physicalExam.assistiveDevices.ventilator && <Badge label="Ventilator" />}
              {!Object.values(handover.physicalExam.assistiveDevices).some(v => v === true) && (
                <p className="text-xs text-slate-400 italic">Tidak ada alat bantu terpasang</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Summary & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <Info size={20} className="text-blue-600" />
            <h3>Ringkasan Pasien</h3>
          </div>
          <div className="card p-6 space-y-4">
            <div>
              <label className="input-label">Penilaian Terkini</label>
              <p className="text-slate-700">{handover.currentAssessment}</p>
            </div>
            <div>
              <label className="input-label">Ringkasan Kondisi</label>
              <p className="text-slate-700">{handover.patientSummary}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <CheckSquare size={20} className="text-blue-600" />
            <h3>Daftar Tindakan (To-Do)</h3>
          </div>
          <div className="card divide-y divide-slate-100">
            {handover.todos.map(todo => (
              <div key={todo.id} className="p-4 flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  todo.completed ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                )}>
                  {todo.completed && <CheckSquare size={14} />}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  todo.completed ? "text-slate-400 line-through" : "text-slate-700"
                )}>
                  {todo.task}
                </span>
              </div>
            ))}
            {handover.todos.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                Tidak ada tindakan terdaftar.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Signature Section for Print */}
      <div className="print-only mt-12 grid grid-cols-2 gap-8 text-center">
        <div>
          <p className="text-sm font-semibold mb-16">Perawat Yang Menyerahkan</p>
          <div className="border-t border-black w-48 mx-auto"></div>
          <p className="text-xs mt-1">( {handover.nurseInCharge} )</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-16">Perawat Yang Menerima</p>
          <div className="border-t border-black w-48 mx-auto"></div>
          <p className="text-xs mt-1">( {handover.nurseNextShift} )</p>
        </div>
      </div>
    </motion.div>
  );
};

const SBARCard = ({ title, content, color }: { title: string, content: string, color: string }) => (
  <div className={cn("p-4 rounded-2xl border", color)}>
    <h4 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">{title}</h4>
    <p className="text-sm font-medium leading-relaxed">{content}</p>
  </div>
);

const Badge = ({ label }: { label: string }) => (
  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase border border-slate-200">
    {label}
  </span>
);
