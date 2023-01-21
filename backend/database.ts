import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm'

@Entity()
export class Message {

    @PrimaryColumn()
    messageid: string

    @Column()
    userid: number

    @Column()
    body: string

    @Column()
    latitude: number

    @Column()
    longitude: number

    @Column()
    postdate: Date

    @Column("text", {array: true})
    upvotes: string[]

    @Column("text", {array: true})
    downvotes: string[]

}