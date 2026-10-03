import { DashboardService } from '../services/DashboardService.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await DashboardService.getAdminStats();
    res.json({ success: true, ...stats });
  } catch (err) {
    next(err);
  }
};
