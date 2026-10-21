/**
 * Security validation patterns targeting SQL injection, NoSQL injection, and XSS attack vectors.
 */
export const SQL_INJECTION_PATTERNS = [
  /('|\")\s*(OR|AND)\s+['"\d\w]+\s*=\s*['"\d\w]+/i,           // ' OR '1'='1' or " AND 1=1
  /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,                // OR 1=1
  /('|\")\s*(--|#|\/\*)/,                                      // ' -- or " -- or '/*
  /\bUNION\s+(ALL\s+)?SELECT\b/i,                             // UNION SELECT
  /\b(DROP|ALTER|TRUNCATE)\s+TABLE\b/i,                        // DROP TABLE
  /\bINSERT\s+INTO\b/i,                                        // INSERT INTO
  /\bDELETE\s+FROM\b/i,                                        // DELETE FROM
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|UNION)\b/i, // ; DROP etc.
  /\bEXEC(\s+XP_)?\b/i,                                        // EXEC xp_cmdshell
  /<script\b[^>]*>/i,                                          // <script>
  /javascript:/i,                                              // javascript:
  /\bon[a-z]+\s*=\s*['"]/i                                     // onerror="
];

/**
 * Validates if the given text is free from SQL injection, script injection, and dangerous payloads.
 * @param {string} val
 * @returns {boolean}
 */
export function isSafeTextInput(val) {
  if (typeof val !== 'string') return true;
  for (const regex of SQL_INJECTION_PATTERNS) {
    if (regex.test(val)) return false;
  }
  return true;
}

/**
 * Returns a descriptive threat message if malicious pattern is detected, otherwise null.
 * @param {string} val
 * @returns {string | null}
 */
export function detectSecurityThreat(val) {
  if (typeof val !== 'string') return null;

  if (
    /('|\")\s*(OR|AND)\s+['"\d\w]+\s*=\s*['"\d\w]+/i.test(val) ||
    /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i.test(val)
  ) {
    return "Potential SQL injection pattern detected (' OR '1'='1'). Please enter safe text.";
  }

  if (/('|\")\s*(--|#|\/\*)/.test(val)) {
    return "Potential SQL comment injection detected (' --). Please remove SQL syntax.";
  }

  if (/\b(UNION\s+(ALL\s+)?SELECT|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM)\b/i.test(val)) {
    return "Disallowed SQL statement detected (UNION, DROP, INSERT, DELETE).";
  }

  if (/<script\b|javascript:|\bon[a-z]+\s*=/i.test(val)) {
    return "Script/XSS injection detected (<script>, javascript:).";
  }

  for (const regex of SQL_INJECTION_PATTERNS) {
    if (regex.test(val)) {
      return "Suspicious characters or SQL syntax detected. Please enter safe text only.";
    }
  }

  return null;
}
