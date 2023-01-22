import "reflect-metadata"
import express, { raw } from 'express';
import { Between, DataSource, Not } from "typeorm";
import { v4 as uuid } from 'uuid';
import { Message } from "./database.js";

const database = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'soapstone',
    entities: [Message],
    synchronize: true,
    logging: false
});

database.initialize()
    .then(() => {
        console.log("Database connection initialized.")
    })
    .catch((err) => console.log(err))

const app = express();
app.use(express.json());

//GET: Get a randomly selected message for current location
app.get('/', async (req, res) => {
    const body = req.body;
    const raw_msgs = (await database.getRepository(Message).findBy({
        userid: Not(body.userid),
        latitude: Between(body.latitude - 0.00005, body.latitude + 0.00005),
        longitude: Between(body.longitude - 0.00005, body.longitude + 0.00005)
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

app.listen(3000);