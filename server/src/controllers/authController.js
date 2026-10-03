import { AuthService } from '../services/AuthService.js';

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await AuthService.login(identifier, password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
