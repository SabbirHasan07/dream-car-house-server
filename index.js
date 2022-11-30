const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 8000

// middlewares
app.use(cors())
app.use(express.json())

// Database Connection
const uri = process.env.DB_URI
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    const usersCollection = client.db('dream-car-house').collection('users')
    const bookingsCollection = client.db('dream-car-house').collection('bookings')
    const cetagoriesCollections = client.db('dream-car-house').collection('cetagories')
    const allproductsCollections = client.db('dream-car-house').collection('allproducts')

    // Save user email & generate JWT
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      console.log(result)

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30d',
      })
      console.log(token)
      res.send({ result, token })
    })

    // Get a single user by email
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }

      const user = await usersCollection.findOne(query)
      console.log(user.role)
      res.send(user)
    })

    // Get all users
    app.get('/users', async (req, res) => {
      const users = await usersCollection.find().toArray()
      console.log(users)
      res.send(users)
    })

    // Save a booking
    app.post('/bookings', async (req, res) => {
      const bookingData = req.body
      const result = await bookingsCollection.insertOne(bookingData)
      console.log(result)
      res.send(result)
    })

    // Get All Bookings
    app.get('/bookings/:email', async (req, res) => {
      const email= req.params.email;
      const query = {email:email}
      const cursor = bookingsCollection.find(query)
      const findResult = await cursor.toArray()
      res.send(findResult);
    })

    app.get('/booking', async (req, res) => {
      const query = {}
      const cursor = bookingsCollection.find(query)
      const booking = await cursor.toArray()
      res.send(booking);
    })


   

    app.post('/allproducts', async (req, res) => {
      const allproducts = req.body
      const result = await allproductsCollections.insertOne(allproducts)
      console.log(result)
      res.send(result)
    })
    app.get('/allproduc', async (req, res) => {
      const query = {}
      const cursor = allproductsCollections.find(query)
      const allproducts = await cursor.toArray()
      res.send(allproducts);
    })

    app.get('/allproduct/:condition', async (req, res) => {
      const condition = req.params.condition
      const query = { condition: condition }
      const cursor = allproductsCollections.find(query)
      const findResult = await cursor.toArray()
      res.send(findResult);
    })

    app.get('/allproducts/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) }
      const order = await allproductsCollections.findOne(query)
      res.send(order)
    })

    app.delete('/book/:id',async (req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
    })

    app.get('/manage/:email', async(req,res)=>{
      const email = req.params.email
      console.log(email);
      const query = {hostemail:email};
      console.log(query);
      const result = await allproductsCollections.find(query).toArray();
     console.log(result);
     res.send(result)
      
    })






    console.log('Database Connected...')
  } finally {
  }
}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('Server is running... in session')
})

app.listen(port, () => {
  console.log(`Server is running...on ${port}`)
})
