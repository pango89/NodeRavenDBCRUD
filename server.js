const express = require('express');
const bodyParser = require('body-parser');
const { DocumentStore } = require('ravendb');

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const port = process.env.port || 8090;
const router = express.Router();

const dbUrl = "http://4.live-test.ravendb.net";
const dbName = "db";
const store = DocumentStore.create(dbUrl, dbName);
store.initialize();

router.use(function (req, res, next) {
    // do logging 
    // do authentication 
    console.log('Logging of request will be done here');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/say', function (req, res){
    setTimeout(() => {
        res.send('Hello World!!');
      }, 1000);
});

router.get('/employees', async function (req, res){
    const session = store.openSession();
    const result = await session.query({collection: 'Employees'}).whereEquals('id', req.query['id']).orderByDescending('LastName').all();  
    
    res.status(200);
    res.type("application/json");
    res.send(JSON.stringify(result));
});

router.post('/employees', async function (req, res){
    const session = store.openSession();
    let employee = req.body;

    employee = await session.store(employee, "employees/");
    await session.saveChanges();

    res.status(200);
    res.type("application/json");
    res.send(JSON.stringify(employee));
});

router.put('/employees', async function (req, res){
    const { id, title } = req.body;
    const session = store.openSession();

    const doc = await session.load(id)
    if (!doc) {
        res.sendStatus(404);
        return;
    }

    doc.Title = title;
    await session.saveChanges();

    res.sendStatus(200);
});

router.delete('/employees', async function (req, res){
    const { id } = req.body;
    let session = store.openSession();

    await session.delete(id);
    await session.saveChanges();

    res.sendStatus(200);
});

app.use('/api', router);
app.listen(port);
console.log('Rest API is running at ' + port);