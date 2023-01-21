import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Message {

    @PrimaryGeneratedColumn()
    messageid: number

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

    @Column()
    score: number

}