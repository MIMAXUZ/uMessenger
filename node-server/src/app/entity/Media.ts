import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Media {

    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(type => User)
    @JoinColumn()
    user!: User[];

    @Column({
        type: "varchar",
        length: 255,
    })
    file_name!: string;

    @Column({
        type: "varchar",
        length: 60,
    })
    file_type!: string;

    @Column({
        type: "varchar",
        unique: true,
    })
    url!: string;

    @Column({
        type: "int",
        width: 11,
    })
    size!: number;
}
