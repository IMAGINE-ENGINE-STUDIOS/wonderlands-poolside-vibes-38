// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

/**
 * Sanitize input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};

/**
 * Validate email format with additional security checks
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const sanitizedEmail = sanitizeInput(email);
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    errors.push('Invalid email format');
  }
  
  // Length validation
  if (sanitizedEmail.length > 254) {
    errors.push('Email address too long');
  }
  
  // Domain validation (basic)
  const parts = sanitizedEmail.split('@');
  if (parts.length === 2) {
    const [local, domain] = parts;
    if (local.length > 64) {
      errors.push('Email local part too long');
    }
    if (domain.length > 253) {
      errors.push('Email domain too long');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedEmail
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: password // Don't sanitize passwords, just validate
  };
};

/**
 * Validate general text input
 */
export const validateTextInput = (
  input: string, 
  minLength: number = 1, 
  maxLength: number = 1000
): ValidationResult => {
  const errors: string[] = [];
  const sanitizedInput = sanitizeInput(input);
  
  if (sanitizedInput.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters long`);
  }
  
  if (sanitizedInput.length > maxLength) {
    errors.push(`Input must be no more than ${maxLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedInput
  };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const sanitizedPhone = sanitizeInput(phone);
  
  // Remove all non-digit characters for validation
  const digitsOnly = sanitizedPhone.replace(/\D/g, '');
  
  // Check for valid US phone number (10 digits) or international format
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    errors.push('Phone number must be between 10 and 15 digits');
  }
  
  // Basic phone format validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(digitsOnly)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedPhone
  };
};

/**
 * Rate limiting utility - simple client-side rate limiting
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing attempts for this identifier
    let attempts = this.attempts.get(identifier) || [];
    
    // Filter out attempts outside the window
    attempts = attempts.filter(timestamp => timestamp > windowStart);
    
    // Check if under the limit
    if (attempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    attempts.push(now);
    this.attempts.set(identifier, attempts);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * CSRF token generation and validation utilities
 */
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length > 0;
};

/**
 * Session validation utilities
 */
export const isSessionValid = (sessionData: any): boolean => {
  if (!sessionData || !sessionData.token || !sessionData.expiresAt) {
    return false;
  }
  
  const expiresAt = new Date(sessionData.expiresAt);
  const now = new Date();
  
  return now < expiresAt;
};

/**
 * Secure session cleanup
 */
export const clearSecureSession = (): void => {
  sessionStorage.removeItem('adminSession');
  localStorage.removeItem('adminSession'); // Clear legacy localStorage as well
};