import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/index.js';
import { config } from '../config/index.js';

export class AuthService {
  static async login(identifier, password) {
    if (!identifier || !password) {
      throw new Error('Please enter username or email, and password.');
    }

    const res = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );

    if (!res.rows || res.rows.length === 0) {
      throw new Error('Invalid credentials. User not found.');
    }

    const user = res.rows[0];

    if (user.status !== 'active') {
      throw new Error('Your account is deactivated. Please contact the administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials. Incorrect password.');
    }

    // Role-specific payload augmentation
    let extraData = {};
    if (user.role === 'student') {
      const sRes = await db.query(
        'SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.user_id = ? LIMIT 1',
        [user.id]
      );
      if (sRes.rows && sRes.rows.length > 0) {
        extraData.student = sRes.rows[0];
        extraData.studentId = sRes.rows[0].id;
        extraData.classId = sRes.rows[0].class_id;
      }
    } else if (user.role === 'teacher') {
      const tRes = await db.query('SELECT * FROM teachers WHERE user_id = ? LIMIT 1', [user.id]);
      if (tRes.rows && tRes.rows.length > 0) {
        extraData.teacher = tRes.rows[0];
        extraData.teacherId = tRes.rows[0].id;
      }
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      studentId: extraData.studentId || null,
      teacherId: extraData.teacherId || null
    };

    let token;
    try {
      token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn || '7d'
      });
    } catch {
      token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: '7d'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: {
        ...userWithoutPassword,
        ...extraData
      }
    };
  }

  static async getMe(userId) {
    const res = await db.query('SELECT id, username, email, role, status, created_at FROM users WHERE id = ?', [userId]);
    if (!res.rows || res.rows.length === 0) {
      throw new Error('User not found.');
    }

    const user = res.rows[0];
    let profile = null;

    if (user.role === 'student') {
      const sRes = await db.query(`
        SELECT s.*, c.name as class_name 
        FROM students s 
        LEFT JOIN classes c ON s.class_id = c.id 
        WHERE s.user_id = ? LIMIT 1
      `, [user.id]);
      profile = sRes.rows[0] || null;
    } else if (user.role === 'teacher') {
      const tRes = await db.query('SELECT * FROM teachers WHERE user_id = ? LIMIT 1', [user.id]);
      profile = tRes.rows[0] || null;
    }

    return { ...user, profile };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required.');
    }

    const res = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!res.rows || res.rows.length === 0) {
      throw new Error('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, res.rows[0].password);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, userId]);
    return { success: true, message: 'Password changed successfully.' };
  }
}
