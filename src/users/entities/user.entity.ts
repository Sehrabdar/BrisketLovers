import * as bcrypt from 'bcryptjs';
import slugify from 'slugify';
import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany, Index } from 'typeorm';

import { BaseEntity } from '../../core/entities/base.entity';
import { UtilsService } from '../../core/utils/utils.service';
import { AccountStatus, CharacterSet } from '../../core/global.constraints';

@Entity('users')
@Index(['email', 'deletedAt'], {unique: true})
export class UserEntity extends BaseEntity {
    @Column({ length: 256 })
    name: string;

    @Column({ length: 256, unique: true })
    username: string;

    @Column({ length: 256 })
    email: string;

    @Column({ length: 512 })
    password: string;

    @Column({ length: 16, nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.Active,
    })
    status: AccountStatus;

    @BeforeInsert()
    @BeforeUpdate()
    async encryptPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    @BeforeInsert()
    generateUsername() {
        this.username = slugify(
            `${this.name}-${UtilsService.generateUniqueId({ length: Number(process.env.SLUG_LENGTH), characterSet: CharacterSet.LowercaseAlphanumeric })}`,
            { lower: true },
        );
    }
}
