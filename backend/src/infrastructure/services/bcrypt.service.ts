import { injectable } from 'tsyringe'; // If using NestJS
import * as bcrypt from 'bcrypt';
import { IHashingService } from '../../core/ports/hashing.service.interface.js';

@injectable()
export class BcryptService implements IHashingService {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}