import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { User } from "./User";
import { ChatMessages } from "./ChatMessages";

@Entity( 'chats' )
export class Chat {

    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(type => User)
    @JoinColumn()
    author!: User;

    @OneToOne(type => User)
    @JoinColumn()
    partner!: User;

    @OneToMany( type => ChatMessages, chat_messages => chat_messages.chat)
    messages!: ChatMessages[];

    @Column({
        default: true,
    })
    is_active!: Boolean;
}