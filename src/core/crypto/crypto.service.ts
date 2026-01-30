import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CryptoService {
    saltOrRounds = 10;

    async hashIt(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltOrRounds);
    }

    async isMatch(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}
