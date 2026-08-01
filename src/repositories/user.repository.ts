import type { UserEntity } from '../shared/types/entities';
import { getDatabase } from '../db/database';

const mapUser = (row: any): UserEntity => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const userRepository = {
  async getById(userId: string) {
    const db = await getDatabase();
    const user = await db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?;', userId);

    return user ? mapUser(user) : null;
  },

  async getByEmail(email: string) {
    const db = await getDatabase();
    const user = await db.getFirstAsync<any>(
      'SELECT * FROM users WHERE lower(email) = lower(?);',
      email.trim()
    );

    return user ? mapUser(user) : null;
  },

  async create(user: UserEntity) {
    const db = await getDatabase();

    await db.runAsync(
      `
        INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
      user.id,
      user.name,
      user.email.trim(),
      user.passwordHash,
      user.createdAt,
      user.updatedAt
    );

    return user;
  },

  async updateProfile(userId: string, name: string, email: string, updatedAt: string) {
    const db = await getDatabase();

    await db.runAsync(
      'UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?;',
      name.trim(),
      email.trim(),
      updatedAt,
      userId
    );

    return this.getById(userId);
  },
};
