import "reflect-metadata"
import express, { raw } from 'express';
import { Between, DataSource, Not } from "typeorm";
import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm'
import { v4 as uuid } from 'uuid';

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

const database = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [ Message ],
    ssl: {
        rejectUnauthorized: false
    },
    synchronize: true,
    logging: false
});

const app = express();
app.use(express.json());

//GET: Get a randomly selected message for current location
app.get('/', async (req, res) => {
    const query = req.query;
    if (!req.query.hasOwnProperty('userid') || !req.query.hasOwnProperty('latitude') || !req.query.hasOwnProperty('longitude'))
        return res.send([{"messageid": "", "body": "", "score": 0, "date": "", "message": "malformed request"}])
    const raw_msgs = (await database.getRepository(Message).findBy({
        userid: Not(query.userid as string),
        latitude: Between(Number(query.latitude as string) - 0.0005, Number(query.latitude as string) + 0.0005),
        longitude: Between(Number(query.longitude as string) - 0.0005, Number(query.longitude as string) + 0.0005)
    })).slice(0, 5);
    const msgs = [];
    for (let i = 0; i < raw_msgs.length; i++) {
        const msg = raw_msgs[i];
        const score = msg.upvotes.length - msg.downvotes.length;
        msgs.push({
            "messageid": msg.messageid,
            "body": msg.body,
            "score": score,
            "date": msg.postdate
        });
    }
    return res.send(msgs);
});

//POST: Post a new message
app.post('/', async (req, res) => {
    const body = req.body
    if (!body.hasOwnProperty('userid') || !body.hasOwnProperty('body') || !body.hasOwnProperty('latitude') || !body.hasOwnProperty('longitude'))
        return res.json({"success": false, "message": "malformed request"})
    const msg = new Message();
    msg.messageid = uuid();
    msg.userid = body.userid;
    msg.body = body.body;
    msg.latitude = body.latitude;
    msg.longitude = body.longitude;
    msg.postdate = new Date();
    msg.upvotes = [];
    msg.downvotes = [];

    database.getRepository(Message).save(msg)
        .then(() => {return res.json({"success": true, "message": ""})})
        .catch((err) => {return res.json({"success": false, "message": err})})
    });

//POST: Vote on a message
app.post('/vote', async (req, res) => {
    const body = req.body;
    if (!body.hasOwnProperty('userid') || !body.hasOwnProperty('messageid') || !body.hasOwnProperty('upvote'))
        return res.json({"success": false, "message": "malformed request"})
    const msg = await database.getRepository(Message).findOneBy({
        messageid: body.messageid
    })
    if (msg == null) return res.json({"success": false, "message": "Could not find message"})
    const upvotes = msg.upvotes;
    const downvotes = msg.downvotes;
    const upIndex = upvotes.indexOf(body.userid);
    if (upIndex != -1) upvotes.splice(upIndex, 1);
    const downIndex = downvotes.indexOf(body.userid);
    if (downIndex != -1) downvotes.splice(downIndex, 1);
    if (body.upvote)
        upvotes.push(body.userid);
    else
        downvotes.push(body.userid);

    msg.upvotes = upvotes;
    msg.downvotes = downvotes;
    database.getRepository(Message).save(msg);
    return res.json({"success": true, "message": ""});
});


database.initialize()
    .then(() => {
        console.log("Database connection initialized.")
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.log(err))