export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    // Hatanın nerede oluştuğunu (dosya/satır) takip edebilmek için:
    Error.captureStackTrace(this, this.constructor);
  }
}