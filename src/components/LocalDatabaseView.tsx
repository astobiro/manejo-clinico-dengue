import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  Activity,
  User,
  Droplets,
  Calendar,
  FileSpreadsheet,
  PlusCircle,
  FileText,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { ClinicalAttendanceRecord } from '../types/database';
import { localDatabase } from '../services/localDatabase';
import { DengueGroup } from '../types';
import { FullTriagePrintData } from '../types/print';

interface LocalDatabaseViewProps {
  onOpenCardPrint: (data: FullTriagePrintData) => void;
  onNavigateToTriage?: () => void;
  onLoadRecordToTriage?: (record: ClinicalAttendanceRecord) => void;
}

export const LocalDatabaseView: React.FC<LocalDatabaseViewProps> = ({
  onOpenCardPrint,
  onNavigateToTriage,
  onLoadRecordToTriage,
}) => {
  // Database records
  const [records, setRecords] = useState<ClinicalAttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  // Confirmation Modals
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<ClinicalAttendanceRecord | null>(null);

  // View Record Details Modal
  const [selectedRecord, setSelectedRecord] = useState<ClinicalAttendanceRecord | null>(null);

  // Load records on mount
  const loadData = async () => {
    setLoading(true);
    try {
      const recs = await localDatabase.getAllRecords();
      setRecords(recs);
    } catch (e) {
      console.error('Erro ao carregar dados do banco local:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch = 
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.patientCpfOrSus && r.patientCpfOrSus.includes(searchQuery)) ||
      r.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = filterGroup === 'all' || r.group === filterGroup;

    return matchesSearch && matchesGroup;
  });

  // Database stats
  const totalRecords = records.length;
  const severeRecords = records.filter(
    (r) => r.group === DengueGroup.GROUP_C || r.group === DengueGroup.GROUP_D
  ).length;
  const mildRecords = records.filter(
    (r) => r.group === DengueGroup.GROUP_A || r.group === DengueGroup.GROUP_B
  ).length;
  const pediatricRecords = records.filter((r) => r.isPediatric || r.patientAge < 13).length;

  // Export JSON
  const handleExportJson = async () => {
    try {
      const jsonStr = await localDatabase.exportDatabaseAsJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dengueflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao exportar JSON: ' + e);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const csvStr = await localDatabase.exportDatabaseAsCsv();
      const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atendimentos_dengue_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao exportar CSV: ' + e);
    }
  };

  // Delete record
  const handleDeleteRecord = async (id: string) => {
    await localDatabase.deleteRecord(id);
    setRecordToDelete(null);
    await loadData();
  };

  // Clear all records
  const handleClearAll = async () => {
    await localDatabase.clearAllRecords();
    setConfirmClearOpen(false);
    await loadData();
  };

  // Convert record to print data
  const handlePrintRecord = (r: ClinicalAttendanceRecord) => {
    const printData: FullTriagePrintData = {
      patientName: r.patientName,
      ageGroup: r.ageGroup || (r.isPediatric || (r.patientAge && r.patientAge < 13) ? 'Criança (< 13 anos)' : (r.patientAge && r.patientAge >= 65) ? 'Idoso (>= 65 anos)' : 'Adulto (< 65 anos)'),
      patientAge: r.patientAge,
      patientWeight: r.patientWeight,
      patientCpfOrSus: r.patientCpfOrSus,
      facilityName: r.facilityName,
      attendingProfessional: r.attendingProfessional,
      evaluationDate: new Date(r.createdAt).toLocaleString('pt-BR'),
      group: r.group,
      title: r.title,
      subtitle: r.subtitle,
      setting: r.setting,
      duration: r.duration,
      diseaseDay: r.diseaseDay,
      stage1Severity: r.stage1Severity,
      stage2Warning: r.stage2Warning,
      stage3Special: r.stage3Special,
      stage4Symptoms: r.stage4Symptoms,
      labData: r.labData,
      conduct: r.conduct,
      mandatoryExams: r.mandatoryExams,
      recommendedExams: r.recommendedExams,
    };

    onOpenCardPrint(printData);
  };

  const getGroupBadgeClass = (group: DengueGroup) => {
    switch (group) {
      case DengueGroup.GROUP_A:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case DengueGroup.GROUP_B:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case DengueGroup.GROUP_C:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case DengueGroup.GROUP_D:
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Privacy Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB]">
                <Database className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Banco de Dados Local de Atendimentos
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Histórico completo de triagens, classificações clínicas e hidratação armazenadas no dispositivo.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToTriage && (
              <button
                type="button"
                onClick={onNavigateToTriage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova Triagem</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={records.length === 0}
              title="Baixar planilha CSV para abrir no Excel ou Calc"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              disabled={records.length === 0}
              title="Exportar backup completo em JSON"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#2563EB]" />
              <span>Exportar JSON</span>
            </button>

            {records.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition border border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Banco</span>
              </button>
            )}
          </div>
        </div>

        {/* Offline & Security Guarantee */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start sm:items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-slate-700">
            <strong>Privacidade & Funcionamento 100% Offline:</strong> Os dados clínicos são salvos exclusivamente no armazenamento interno do seu navegador/dispositivo (IndexedDB). Nenhum dado do paciente é transmitido para servidores externos sem o seu comando explícito.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total de Atendimentos
            </span>
            <span className="text-2xl font-black text-slate-900">{totalRecords}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Casos Graves (C / D)
            </span>
            <span className="text-2xl font-black text-rose-600">{severeRecords}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Ambulatoriais (A / B)
            </span>
            <span className="text-2xl font-black text-emerald-600">{mildRecords}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pediátricos (&lt; 13 anos)
            </span>
            <span className="text-2xl font-black text-purple-600">{pediatricRecords}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome do paciente, unidade ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
            />
          </div>

          {/* Group Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterGroup('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                filterGroup === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterGroup(DengueGroup.GROUP_A)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                filterGroup === DengueGroup.GROUP_A
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Grupo A
            </button>
            <button
              type="button"
              onClick={() => setFilterGroup(DengueGroup.GROUP_B)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                filterGroup === DengueGroup.GROUP_B
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Grupo B
            </button>
            <button
              type="button"
              onClick={() => setFilterGroup(DengueGroup.GROUP_C)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                filterGroup === DengueGroup.GROUP_C
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Grupo C
            </button>
            <button
              type="button"
              onClick={() => setFilterGroup(DengueGroup.GROUP_D)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                filterGroup === DengueGroup.GROUP_D
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Grupo D
            </button>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span>Atendimentos Cadastrados</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'registro' : 'registros'}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Carregando registros do banco local...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-2xl text-slate-400">
              📂
            </div>
            <h4 className="font-bold text-slate-800 text-base">Nenhum atendimento encontrado</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {records.length === 0 
                ? 'Os atendimentos finalizados na aba "Classificação de Risco" podem ser gravados no banco de dados local com apenas um clique.'
                : 'Nenhum registro corresponde aos filtros selecionados.'}
            </p>
            {onNavigateToTriage && records.length === 0 && (
              <button
                type="button"
                onClick={onNavigateToTriage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Iniciar Primeiro Atendimento</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((r) => {
              const formattedDate = new Date(r.createdAt).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={r.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg border ${getGroupBadgeClass(
                          r.group
                        )}`}
                      >
                        {r.group}
                      </span>

                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {r.patientName}
                      </span>

                      <span className="text-xs text-slate-500 font-medium">
                        • {r.ageGroup || (r.isPediatric || (r.patientAge && r.patientAge < 13) ? 'Criança (< 13 anos)' : (r.patientAge && r.patientAge >= 65) ? 'Idoso (>= 65 anos)' : 'Adulto (< 65 anos)')} • {r.patientWeight} kg
                      </span>

                      {r.diseaseDay > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          Dia {r.diseaseDay}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" /> {formattedDate}
                      </span>
                      <span>
                        <strong>Local:</strong> {r.setting}
                      </span>
                      <span>
                        <strong>Unidade:</strong> {r.facilityName}
                      </span>
                    </div>

                    {/* Quick Clinical Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {r.stage1Severity.detectedList.length > 0 && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Gravidade ({r.stage1Severity.detectedList.length})
                        </span>
                      )}

                      {r.stage2Warning.detectedList.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Alarme ({r.stage2Warning.detectedList.length})
                        </span>
                      )}

                      {r.stage3Special.detectedList.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-md">
                          Condições Especiais ({r.stage3Special.detectedList.length})
                        </span>
                      )}

                      {r.tourniquetTest && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          r.tourniquetTest.isPositive
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          Laço: {r.tourniquetTest.isPositive ? 'Positiva' : 'Negativa'}
                        </span>
                      )}

                      {r.hydrationCalc && (
                        <span className="text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-sky-600" />
                          {r.hydrationCalc.totalDailyVolumeMl} mL/dia
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      title="Ver fluxo clínico completo"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Detalhes</span>
                    </button>

                    {onLoadRecordToTriage && (
                      <button
                        type="button"
                        onClick={() => onLoadRecordToTriage(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition border border-indigo-200"
                        title="Carregar atendimento para editar ou atualizar na triagem"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar / Atualizar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePrintRecord(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs transition border border-blue-200"
                      title="Imprimir Cartão de Acompanhamento"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Cartão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecordToDelete(r)}
                      className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Excluir este atendimento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-black px-3 py-1 rounded-xl border ${getGroupBadgeClass(
                    selectedRecord.group
                  )}`}
                >
                  {selectedRecord.group}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {selectedRecord.patientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRecord.facilityName} • {new Date(selectedRecord.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
              {/* Demographics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Faixa Etária</span>
                  <span className="font-bold text-slate-800">
                    {selectedRecord.ageGroup || (selectedRecord.isPediatric || (selectedRecord.patientAge && selectedRecord.patientAge < 13) ? 'Criança (< 13 anos)' : (selectedRecord.patientAge && selectedRecord.patientAge >= 65) ? 'Idoso (>= 65 anos)' : 'Adulto (< 65 anos)')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Peso</span>
                  <span className="font-bold text-slate-800">{selectedRecord.patientWeight} kg</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Dia de Doença</span>
                  <span className="font-bold text-slate-800">Dia {selectedRecord.diseaseDay}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Local Recomendado</span>
                  <span className="font-bold text-slate-800">{selectedRecord.setting}</span>
                </div>
              </div>

              {/* Signs & Symptoms */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-1">
                  <Activity className="w-4 h-4 text-[#2563EB]" />
                  <span>Critérios Clínicos Identificados</span>
                </h4>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-bold text-rose-700 block">Sinais de Gravidade / Choque:</span>
                    {selectedRecord.stage1Severity.detectedList.length > 0 ? (
                      <ul className="list-disc pl-5 text-xs text-slate-700">
                        {selectedRecord.stage1Severity.detectedList.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-500 italic pl-1">Nenhum sinal de gravidade detectado</span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-amber-700 block">Sinais de Alarme:</span>
                    {selectedRecord.stage2Warning.detectedList.length > 0 ? (
                      <ul className="list-disc pl-5 text-xs text-slate-700">
                        {selectedRecord.stage2Warning.detectedList.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-500 italic pl-1">Nenhum sinal de alarme detectado</span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-blue-700 block">Condições Clínicas Especiais / Sociais:</span>
                    {selectedRecord.stage3Special.detectedList.length > 0 ? (
                      <ul className="list-disc pl-5 text-xs text-slate-700">
                        {selectedRecord.stage3Special.detectedList.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-500 italic pl-1">Nenhuma condição especial marcada</span>
                    )}
                  </div>

                  {selectedRecord.tourniquetTest && (
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Prova do Laço: </span>
                      <span className={selectedRecord.tourniquetTest.isPositive ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {selectedRecord.tourniquetTest.isPositive 
                          ? `Positiva (${selectedRecord.tourniquetTest.petechiaeCount || 0} petéquias)` 
                          : 'Negativa'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conduct & Hydration */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-1">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>Conduta Médica & Hidratação</span>
                </h4>

                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs space-y-1.5">
                  <p><strong>Plano de Hidratação:</strong> {selectedRecord.conduct.hydration}</p>
                  {selectedRecord.hydrationCalc && (
                    <p><strong>Volume Total Calculado:</strong> {selectedRecord.hydrationCalc.totalDailyVolumeMl} mL/dia ({selectedRecord.hydrationCalc.oralRehydrationMl} mL SRO + {selectedRecord.hydrationCalc.homeFluidsMl} mL líquidos caseiros)</p>
                  )}
                  <p><strong>Reavaliação:</strong> {selectedRecord.conduct.reassessment}</p>
                </div>

                {selectedRecord.mandatoryExams.length > 0 && (
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">Exames Obrigatórios:</span>
                    <ul className="list-disc pl-5 text-slate-700 mt-1">
                      {selectedRecord.mandatoryExams.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">ID: {selectedRecord.id}</span>
              <div className="flex items-center gap-2">
                {onLoadRecordToTriage && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadRecordToTriage(selectedRecord);
                      setSelectedRecord(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar / Atualizar na Triagem</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handlePrintRecord(selectedRecord);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Cartão</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Excluir Atendimento?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Tem certeza que deseja excluir o atendimento de <strong>{recordToDelete.patientName}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRecord(recordToDelete.id)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Limpar Todo o Banco?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Isso apagará permanentemente todos os <strong>{records.length} atendimentos</strong> gravados neste dispositivo. Recomendamos exportar uma cópia (JSON ou CSV) antes de continuar.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
