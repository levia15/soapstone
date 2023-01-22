import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm'

@Entity()
export class Message {

    @PrimaryColumn()
    messageid: string

    @Column()
    userid: string

    @Column()
    body: string

    @Column("numeric")
    latitude: number

    @Column("numeric")
    longitude: number

    @Column()
    postdate: Date

    @Column("text", {array: true})
    upvotes: string[]

    @Column("text", {array: true})
    downvotes: string[]

}