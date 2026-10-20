import { ClinicalAttendanceRecord } from '../types/database';

const DB_NAME = 'DengueFlowLocalDB_v1';
const DB_VERSION = 1;
const STORE_ATTENDANCES = 'attendances';

const LOCAL_STORAGE_FALLBACK_KEY = 'dengue_local_attendances_fallback_v1';

// Open IndexedDB connection with promise
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado neste navegador'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_ATTENDANCES)) {
        const store = db.createObjectStore(STORE_ATTENDANCES, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('group', 'group', { unique: false });
        store.createIndex('patientName', 'patientName', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// LocalStorage fallback helpers
const getFallbackRecords = (): ClinicalAttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveFallbackRecords = (records: ClinicalAttendanceRecord[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Falha ao gravar no LocalStorage fallback:', e);
  }
};

export const localDatabase = {
  // Get all clinical attendance records sorted by createdAt desc
  async getAllRecords(): Promise<ClinicalAttendanceRecord[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ATTENDANCES, 'readonly');
        const store = tx.objectStore(STORE_ATTENDANCES);
        const request = store.getAll();

        request.onsuccess = () => {
          const list = (request.result as ClinicalAttendanceRecord[]) || [];
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback to localStorage
      const list = getFallbackRecords();
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
  },

  // Get single record by ID
  async getRecordById(id: string): Promise<ClinicalAttendanceRecord | undefined> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ATTENDANCES, 'readonly');
        const store = tx.objectStore(STORE_ATTENDANCES);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result as ClinicalAttendanceRecord | undefined);
        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = getFallbackRecords();
      return list.find((r) => r.id === id);
    }
  },

  // Save or update an attendance record
  async saveRecord(record: ClinicalAttendanceRecord): Promise<void> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_ATTENDANCES, 'readwrite');
        const store = tx.objectStore(STORE_ATTENDANCES);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = getFallbackRecords();
      const index = list.findIndex((r) => r.id === record.id);
      if (index >= 0) {
        list[index] = record;
      } else {
        list.push(record);
      }
      saveFallbackRecords(list);
    }
  },

  // Delete single record
  async deleteRecord(id: string): Promise<void> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_ATTENDANCES, 'readwrite');
        const store = tx.objectStore(STORE_ATTENDANCES);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = getFallbackRecords().filter((r) => r.id !== id);
      saveFallbackRecords(list);
    }
  },

  // Clear all records
  async clearAllRecords(): Promise<void> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_ATTENDANCES, 'readwrite');
        const store = tx.objectStore(STORE_ATTENDANCES);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      saveFallbackRecords([]);
    }
  },

  // Export records as JSON
  async exportDatabaseAsJson(): Promise<string> {
    const records = await this.getAllRecords();
    return JSON.stringify({
      appName: 'DengueFlow',
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      records,
    }, null, 2);
  },

  // Export records as CSV with semicolon separator (standard for Excel pt-BR)
  async exportDatabaseAsCsv(): Promise<string> {
    const records = await this.getAllRecords();
    const headers = [
      'ID',
      'Data/Hora',
      'Paciente',
      'Idade (anos)',
      'Peso (kg)',
      'Dia de Doenca',
      'Grupo de Risco',
      'Local Recomendado',
      'Unidade/Servico',
      'Profissional',
      'Sinais de Alarme',
      'Sinais de Gravidade',
      'Condicoes Especiais',
      'Prova do Laco',
      'Plano Hidratacao',
      'Exames Obrigatorios',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = records.map((r) => [
      escapeCsv(r.id),
      escapeCsv(new Date(r.createdAt).toLocaleString('pt-BR')),
      escapeCsv(r.patientName),
      escapeCsv(r.patientAge),
      escapeCsv(r.patientWeight),
      escapeCsv(r.diseaseDay),
      escapeCsv(r.group),
      escapeCsv(r.setting),
      escapeCsv(r.facilityName),
      escapeCsv(r.attendingProfessional),
      escapeCsv(r.stage2Warning.detectedList.join(' | ') || 'Nenhum'),
      escapeCsv(r.stage1Severity.detectedList.join(' | ') || 'Nenhum'),
      escapeCsv(r.stage3Special.detectedList.join(' | ') || 'Nenhuma'),
      escapeCsv(r.tourniquetTest ? (r.tourniquetTest.isPositive ? `Positiva (${r.tourniquetTest.petechiaeCount} petequias)` : 'Negativa') : 'Nao realizada'),
      escapeCsv(r.conduct.hydration),
      escapeCsv(r.mandatoryExams.join(' | ')),
    ]);

    return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
  },
};
