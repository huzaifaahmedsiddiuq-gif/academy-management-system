export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role [${req.user.role}] does not have permission to perform this action.`
      });
    }

    next();
  };
};

/**
 * Strict Student Isolation Guard
 * Enforces that a student can only view/modify their own student profile and records.
 */
export const enforceStudentSelf = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'teacher') {
    return next(); // Admins and teachers can proceed subject to class assignments
  }

  if (req.user.role === 'student') {
    // If student, check if requested studentId matches their own student ID or user ID
    const targetStudentId = req.params.studentId || req.params.id || req.query.studentId || req.body.studentId;
    if (targetStudentId && req.user.studentId && parseInt(targetStudentId, 10) !== parseInt(req.user.studentId, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: You are not authorized to view another student\'s records.'
      });
    }
  }

  next();
};
