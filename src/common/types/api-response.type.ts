export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    statusCode: number;
    message: string | string[];
    timestamp: string;
    path: string;
  };
  meta?: any;
}
