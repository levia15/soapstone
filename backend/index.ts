import "reflect-metadata"
import express from 'express';
import { DataSource } from "typeorm";
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

//GET: Get a randomly selected message for current location
app.get('/', (req, res) => {

});

//POST: Post a new message
app.post('/', (req, res) => {
    const msg = new Message();
    msg.messageid = uuid();
});

//POST: Vote on a message
app.post('/vote', (req, res) => {

});