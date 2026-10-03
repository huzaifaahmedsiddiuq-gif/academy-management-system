import db from '../database/index.js';

export class SettingsService {
  static async getSettings() {
    const res = await db.query('SELECT * FROM academy_settings LIMIT 1');
    if (res.rows && res.rows.length > 0) {
      return res.rows[0];
    }
    // Return default settings if table empty
    return {
      id: 1,
      academy_name: 'Apex Horizon Academy',
      tagline: 'Inspiring Minds, Building Leaders & Shaping Futures',
      logo_url: '',
      address: 'Main Campus, Sector 11-A, University Road',
      phone: '+92 300 9876543',
      email: 'admissions@apexhorizon.edu.pk',
      whatsapp_number: '923009876543',
      currency_symbol: 'Rs.',
      academic_year: '2025-2026',
      theme_color: '#4f46e5'
    };
  }

  static async updateSettings(data) {
    const existing = await this.getSettings();
    if (!existing || !existing.id) {
      const insertSql = `
        INSERT INTO academy_settings (academy_name, tagline, logo_url, address, phone, email, whatsapp_number, currency_symbol, academic_year, theme_color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(insertSql, [
        data.academy_name || 'Apex Horizon Academy',
        data.tagline || '',
        data.logo_url || '',
        data.address || '',
        data.phone || '',
        data.email || '',
        data.whatsapp_number || '',
        data.currency_symbol || 'Rs.',
        data.academic_year || '2025-2026',
        data.theme_color || '#4f46e5'
      ]);
    } else {
      const updateSql = `
        UPDATE academy_settings
        SET academy_name = ?, tagline = ?, logo_url = ?, address = ?, phone = ?, email = ?,
            whatsapp_number = ?, currency_symbol = ?, academic_year = ?, theme_color = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await db.query(updateSql, [
        data.academy_name,
        data.tagline,
        data.logo_url,
        data.address,
        data.phone,
        data.email,
        data.whatsapp_number,
        data.currency_symbol,
        data.academic_year,
        data.theme_color,
        existing.id
      ]);
    }
    return await this.getSettings();
  }
}
