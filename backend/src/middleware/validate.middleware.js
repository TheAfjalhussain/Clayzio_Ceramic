/**
 * ============================================
 * ✅ VALIDATION MIDDLEWARE
 * ============================================
 * Request validation using express-validator
 */

import { validationResult } from 'express-validator';

/**
 * Check for validation errors and return formatted response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      errors: extractedErrors
    });
  }
  
  next();
};

export default validate;
