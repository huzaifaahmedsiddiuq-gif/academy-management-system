import { SettingsService } from '../services/SettingsService.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingsService.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await SettingsService.updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (err) {
    next(err);
  }
};
