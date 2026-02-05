export class SanitizeUtil {
  static removeHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  static truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    allowedKeys: string[],
  ): Partial<T> {
    const result: Partial<T> = {};
    for (const key of allowedKeys) {
      if (key in obj) {
        result[key as keyof T] = obj[key];
      }
    }
    return result;
  }
}
