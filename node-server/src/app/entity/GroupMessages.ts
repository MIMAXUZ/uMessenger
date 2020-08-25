import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    OneToOne, 
    JoinColumn, 
    ManyToOne, 
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";
import { Media } from "./Media";

@Entity()
export class GroupMessages {

    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(type => User)
    @JoinColumn()
    user!: User;

    @ManyToOne(type => Group, groups => groups.messages)
    group!: Group;

    @Column({
        type: 'text',
    })
    message!: string;

    @OneToOne(type => Media)
    @JoinColumn()
    media!: Media[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}