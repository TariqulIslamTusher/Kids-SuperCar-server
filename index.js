const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

// env file
console.log(process.env.DB_USER);  
console.log(process.env.DB_PASS);  



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hskwi4h.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run =async()=> {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyDatabase = client.db("toysDB").collection('toys')

    // get all data from database
    app.get('/products', async(req, res)=>{
      const cursor =  toyDatabase.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // get only the data added by me 
    app.get('/myAddedToys', async(req, res)=>{
      const result = await toyDatabase.find().toArray()
      res.send(result)
    })


    // add product by a form in the database
    app.post('/addProduct', async (req, res)=>{
        const newProduct = req.body
        console.log(newProduct);
        const result = await toyDatabase.insertOne(newProduct);
        res.send(result)
    })


    // delete the products
    app.delete('/products/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await toyDatabase.deleteOne(query)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('sever site is running')
})


// try basis
// const jsonData = require('./toys.json')
// app.get('/json', (req, res) =>{
//     res.send(jsonData)
// })


// listen on the sever console
app.listen(port, ()=>{
    console.log(`server is running on port: ${port}`);
})