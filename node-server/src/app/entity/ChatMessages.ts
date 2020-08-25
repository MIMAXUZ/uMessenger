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
import { Chat } from "./Chat";
import { Media } from "./Media";

@Entity()
export class ChatMessages {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne( type => User )
    user!: User[];


    @ManyToOne( type => Chat, groups => groups.messages, { onDelete: 'CASCADE' })
    chat!: Chat;

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