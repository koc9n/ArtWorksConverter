export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UserSession {
  userId: string;
  email: string;
  token: string;
  createdAt: Date;  
} 