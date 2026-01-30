import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

import { CharacterSet } from '../global.constraints';

type Options = {
    length: number;
    characterSet: CharacterSet;
    includeDate?: boolean;
};
@Injectable()
export class UtilsService {
    constructor() {}

    static generateUniqueId(options: Options) {
        const now = new Date();

        let timestamp = '';

        if (options.includeDate) {
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const second = String(now.getSeconds()).padStart(2, '0');

            timestamp += `${year}${month}${day}${hour}${minute}${second}`;
        }

        const uniqueString = customAlphabet(options.characterSet, options.length)();

        return timestamp + uniqueString;
    }

    static formattedDate(date: Date): string {
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}

