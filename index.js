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

        //post : add a new product
        app.post('/inventory', async(req, res) => {
            const product = req.body;
            const result = await inventoryCollection.insertOne(product);
            res.send(result);
        })

        //update product : reStock
        app.put('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            console.log(req.body)
            const updatedQuantity = (req.body);
            console.log(updatedQuantity)
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.updatedQuantity
                }
            };
            const result = await inventoryCollection.updateOne(filter, updatedDoc, options)
            res.send(result);
        })

        //delivered product : decrease quantity
        app.put('/inventory/deliver/:id', async(req, res) => {
            const id = req.params.id;
            const {newQuantity} = req.body;
            console.log(req.body.newQuantity, id);
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: newQuantity
                }
            };
            const result = await inventoryCollection.updateOne(filter, updatedDoc, options)
            res.send(result);

        })


        app.get('/inventory/myItem/:email', async(req, res) => {
            const {email} = req.params;
            if(email){
                const query = {email};
                const cursor = inventoryCollection.find(query);
                const inventory = await cursor.toArray();
                return res.send(inventory);
            }
            // return res.send('email')
        })

        //Delete a product
        app.delete('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })

        //Delete product from my item
        app.delete('/inventory/myItem/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })


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