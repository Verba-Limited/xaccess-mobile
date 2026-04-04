/** Matches NestJS `TransformInterceptor` + `GlobalExceptionFilter` shape */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  unitLabel?: string | null;
  role: string;
  communityId: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthPayload {
  accessToken: string;
  user: PublicUser;
}
