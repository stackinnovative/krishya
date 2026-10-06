export interface LoginResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}