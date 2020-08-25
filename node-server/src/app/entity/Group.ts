import {
     Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    ManyToMany, 
    JoinTable, 
    OneToMany 
} from "typeorm";
import { User } from "./User";
import { GroupMessages } from "./GroupMessages";

@Entity( 'groups' )
export class Group {

    @PrimaryGeneratedColumn()
    id!: number;

    // post has relation with details. not cascades here. means cannot be persisted, updated or removed
    @OneToMany(type => User, owner=>owner.groups)
   // @JoinColumn()
    owner!: User;

    @ManyToMany(type => User)
    @JoinTable()
    members!: User[];

    @OneToMany(type => GroupMessages, group_messages => group_messages.group)
    messages!: GroupMessages[];

    @Column({
        type: "varchar",
        length: 60,
    })
    name!: string;

    @Column({
        type: "varchar",
        length: 60,
        default: null,
        unique: true,
    })
    url!: string;

    @Column({
        type: "varchar",
        length: 255,
        default: "",
    })
    description!: string;

    @Column({
        type: "varchar",
        default: "uploads/group.png"
    })
    avatar!: string;

    @Column( {
        default: true,
    })
    is_private!: Boolean;

    @Column({
        default: true,
    })
    is_active!: Boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}