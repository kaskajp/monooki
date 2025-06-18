import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/monooki.db');

class Database {
  private db: sqlite3.Database;
  public run: (sql: string, params?: any[]) => Promise<any>;
  public get: (sql: string, params?: any[]) => Promise<any>;
  public all: (sql: string, params?: any[]) => Promise<any[]>;

  constructor() {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database at:', DB_PATH);
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
      }
    });

    // Promisify database methods after db is initialized
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public getDb(): sqlite3.Database {
    return this.db;
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export const getDatabase = (): Database => {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
};

export default getDatabase; 