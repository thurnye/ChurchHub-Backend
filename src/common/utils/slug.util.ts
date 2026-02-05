import slugify from 'slugify';
import { nanoid } from 'nanoid';

export class SlugUtil {
  static generate(text: string, options?: { unique?: boolean }): string {
    const slug = slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (options?.unique) {
      return `${slug}-${nanoid(8)}`;
    }

    return slug;
  }
}
