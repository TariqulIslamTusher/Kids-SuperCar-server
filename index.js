const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 4000

// middleware

const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}
// app.use(cors())
app.use(cors(corsConfig))
// PushSubscriptionOptions("", cors(corsConfig))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hskwi4h.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const toyDatabase = client.db("toysDB").collection('toys')

    // get all data from database
    // ************************************************
    // Standard Procedure of sorting data, data is sorted as ascending, descending and by name

    app.get('/products', async (req, res) => {

      let query = {}
      let options = {}

      const sort = req.query.sort
      const search = req.query.search
      console.log(req.query);

      if (req.query?.email && req.query?.search) {
        query = {
          sellerEmail: req.query.email, toyName: {
            $regex: search,
            $options: 'i'
          }
        }
      } else if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      } else if (req.query?.search) {
        query = {
          toyName: {
            $regex: search,
            $options: 'i'
          }
        }
      } else {
        query = {}
      }

      if (sort === 'name') {
        options = {
          sort: { "toyName": 1 }
        }
      } else {
        options = {
          sort: { "price": sort === 'lowPrice' ? 1 : -1 }
        }
      }
      // $regex formate *************
      // {
      //   "first_name": {
      //      "$regex": "Harriet",
      //      "$options": "i"
      //   }

      // if (req.query?.search) {
      //   query = { toyName : {
      //     $regex : search,
      //     $options: 'i'
      //   }}
      // }
      const cursor = toyDatabase.find(query, options)
      const result = await cursor.toArray()
      res.send(result)
    })



    // get all data from database by sorting methode Accendingly But this system is not a standard one ********************** 

    // app.get('/accendProducts', async (req, res) => {
    //   const query = {}
    //   const cursor = toyDatabase.find(query).sort({ price: 1 })
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })

    // // get all data from database by sorting methode Deccendingly
    // app.get('/deccendProducts', async (req, res) => {
    //   const query = {}
    //   const cursor = toyDatabase.find(query).sort({ price: -1 })
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })

    // // get all data from database by sorting methode By name
    // app.get('/nameProducts', async (req, res) => {
    //   const query = {}
    //   const cursor = toyDatabase.find(query).sort({ toyName: 1 })
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })

    // get item by specific id for single view details card
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const user = await toyDatabase.findOne(query)
      res.send(user)
    })




    // get all the from data base only for user in accending order

    // app.get('/addedProductsAccend', async (req, res) => {
    //   let query = {}
    //   if (req.query?.email) {
    //     query = { sellerEmail: req.query.email }
    //   }
    //   const cursor = toyDatabase.find(query).sort({ price: 1 })
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })

    // // get all the from data base only for user in deccending order

    // app.get('/addedProductsDeccend', async (req, res) => {
    //   let query = {}
    //   console.log(req.query.email);
    //   if (req.query?.email) {
    //     query = { sellerEmail: req.query.email }
    //   }
    //   const cursor = toyDatabase.find(query).sort({ price: -1 })
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })

    // // get all the from data base only for user in by name order

    // app.get('/addedProductsName', async (req, res) => {
    //   let query = {}
    //   if (req.query?.email) {
    //     query = { sellerEmail: req.query.email }
    //   }
    //   const cursor = toyDatabase.find(query).sort({ toyName: 1 })
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })




    // ***************searching ************************
    // get all data from database by searching methode By name for searching
    // this methodes isnot a standard procedure

    // app.get('/productsByName', async (req, res) => {
    //   const name = req.query.toyName
    //   const query = { toyName: name }
    //   const options = {
    //     projection: { toyName: 1 },
    //   };
    //   const cursor = toyDatabase.find(query, options)
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })



    // *******************************************
    // get all the data under category match by the category the tab wants
    app.get('/category', async (req, res) => {
      const category = req.query.category
      console.log(category)
      const query = { category: category }
      const options = {
        projection: { category: 1, toyName: 1, sellerName: 1, price: 1, rating: 1, availableQty: 1, photoURL: 1, description: 1 }
      };
      const cursor = toyDatabase.find(query, options)
      const result = await cursor.toArray()
      res.send(result)
    })


    // //get data by query from the req
    // app.get('/addedProducts', async (req, res) => {
    //   let query = {}
    //   if (req.query?.email) {
    //     query = { sellerEmail: req.query.email }
    //   }
    //   const result = await toyDatabase.find(query).toArray()
    //   res.send(result)
    // })



    // add product by a form in the database
    app.post('/addProduct', async (req, res) => {
      const newProduct = req.body
      const result = await toyDatabase.insertOne(newProduct);
      res.send(result)
    })


    //************** */ delete the products
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyDatabase.deleteOne(query)
      res.send(result)
    })


    // ************** Update items by using PUT or Patch for a single ID
    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedProducts = req.body
      const updateDoc = {
        $set: {
          price: updatedProducts.price,
          availableQty: updatedProducts.qty,
          description: updatedProducts.description
        }
      }

      console.log(updatedProducts);

      const result = await toyDatabase.updateMany(filter, updateDoc)
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


app.get('/', (req, res) => {
  res.send('sever site is running')
})


// try basis
// const jsonData = require('./toys.json')
// app.get('/json', (req, res) =>{
//     res.send(jsonData)
// })


// listen on the sever console
app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
})
// module.exports = app;
