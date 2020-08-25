import {
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany
} from "typeorm";
import bcrypt from 'bcrypt'
import {
    PasswordEncryption,
} from "../../util";
import { Group } from "./Group";

@Entity( 'users' )
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 60,
    })
    first_name!: string;

    @Column({
        type: "varchar",
        length: 60,
    })
    last_name!: string;

    @Column({
        type: "varchar",
        length: 60,
        default: null,
        unique: true,
    })
    username!: string;

    @Column({
        type: "varchar",
        length: 60,
        unique: true,
        select: false
    })
    email!: string;

    @Column({
        type: "varchar",
        default: "uploads/avatar.png"
    })
    avatar!: string;

    @Column({
        default: null,
        select: false
    })
    birthday!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        select: false,
    })
    last_seen!: Date;

    @Column({
        default: true,
        select: false
    })
    confirmed!: Boolean;

    @Column({
        default: true,
        select: false
    })
    is_active!: Boolean;

    @Column({
        type: "varchar",
        select: false
    })
    password!: string;

    @CreateDateColumn({ 
        type: 'timestamp',
        select: false
     })
    created_at!: Date;

    @UpdateDateColumn({ 
        type: 'timestamp',
        select: false
    })
    updated_at!: Date;

    // relations with groups
    @OneToMany( type => Group, group => group.owner )
    groups: Group[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            this.password = await PasswordEncryption(this.password);
        }
    }

    checkUserPasswordCrypt(onencryptedPassword: string) {
        return bcrypt.compareSync(onencryptedPassword, this.password);
    }
}
