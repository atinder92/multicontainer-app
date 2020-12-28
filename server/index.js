const keys = require('./keys');
const {Pool} = require('pg');
const redis = require('redis');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// setting express server
const app = express();
app.use(cors());
app.use(bodyParser.json());

// postGreSql setup
const pgClient = new Pool({
    user: keys.postGreSqlUser,
    host: keys.postGreSqlHost,
    database: keys.postGreSqlDatabase,
    password: keys.postGreSqlPassword,
    port: keys.postGreSqlPort
});

pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
});

// redis client setup
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// routes
app.get('/', (req, res) => {
    res.send('Hi there');
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if(parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }
    redisClient.hset('values', index, 'Nothing yet');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({working: true});

})

pgClient.on("error", () => console.log('Lost PG connection'));

app.listen(5000, () => {
    console.log('App running');
})