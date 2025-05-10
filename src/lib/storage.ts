import { Project } from '@/types/interfaces';
import Dexie, { type Table } from 'dexie';

class SolfaParserDB extends Dexie {
  // Tables
  projects!: Table<Project, 'id'>;

  constructor() {
    super('SolfaParserDB');
    this.version(1).stores({
      projects: '++id, title, composer, key, time, tempoText, tempoBpm, measures',
    });
  }
}

const db = new SolfaParserDB();
export default db;