import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { APP_DB_NAME } from '../shared/constants/defaults';
import { DATABASE_VERSION, migrations } from './migrations';

let databasePromise: Promise<SQLiteDatabase> | null = null;

const migrateDatabase = async (db: SQLiteDatabase) => {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return db;
  }

  for (let index = currentVersion; index < migrations.length; index += 1) {
    await db.execAsync(migrations[index]);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);

  return db;
};

export const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(APP_DB_NAME).then(migrateDatabase);
  }

  return databasePromise;
};
