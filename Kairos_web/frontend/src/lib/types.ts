export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  
  export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
  };