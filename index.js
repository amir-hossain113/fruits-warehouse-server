const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


//database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pgb2t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const inventoryCollection = client.db("inventoryDb").collection("products");
        
        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventory = await cursor.toArray();
            res.send(inventory);
        });

        app.get('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await inventoryCollection.findOne(query);
            res.send(product);
        });

    }
    finally{

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Running Fruits Warehouse Server");
});

app.listen(port, () => {
    console.log('Listening to port', port);
})