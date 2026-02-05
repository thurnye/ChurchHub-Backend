import { APP_CONSTANTS } from '../constants/app.constants';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginationUtil {
  static getSkipLimit(params: PaginationParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(
      params.limit || APP_CONSTANTS.DEFAULT_PAGE_SIZE,
      APP_CONSTANTS.MAX_PAGE_SIZE,
    );
    const skip = (page - 1) * limit;

    return { skip, limit, page };
  }

  static getSkip(page: number, limit: number): number {
    return (Math.max(1, page) - 1) * limit;
  }

  static paginate<T>(
    data: T[],
    total: number,
    params: { page: number; limit: number },
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / params.limit);
    return {
      data,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
      },
    };
  }

  static buildResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams,
  ): PaginatedResult<T> {
    const { page, limit } = this.getSkipLimit(params);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
