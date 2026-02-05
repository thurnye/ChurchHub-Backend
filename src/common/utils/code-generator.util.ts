import { customAlphabet } from 'nanoid';

export class CodeGeneratorUtil {
  private static readonly ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly NUMERIC = '0123456789';

  static generateJoinCode(length: number = 6): string {
    const nanoid = customAlphabet(this.ALPHANUMERIC, length);
    return nanoid();
  }

  static generateVerificationCode(length: number = 6): string {
    const nanoid = customAlphabet(this.NUMERIC, length);
    return nanoid();
  }

  static generateReferenceNumber(prefix: string = ''): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = customAlphabet(this.ALPHANUMERIC, 6)();
    return `${prefix}${timestamp}${random}`;
  }
}
