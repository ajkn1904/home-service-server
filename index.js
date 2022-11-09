const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7splzic.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
        const serviceCollections = client.db('homeService').collection('services')

        app.get('/services', async(req,res) => {
          const query = {};
          const cursor = serviceCollections.find(query);
          const services = await cursor.toArray();
          res.send(services);
        });

        app.get('/limitedservices', async(req,res) => {
          const query = {};
          const cursor = serviceCollections.find(query);
          const services = await cursor.limit(3).toArray();
          res.send(services);
        });

        app.get('/services/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const service = await serviceCollections.findOne(query);
          res.send(service);
        })

    }
    finally{

    }

}
run().catch(error => console.error(error));



async function reviewApi(){

  try{
      const serviceCollections = client.db('homeService').collection('reviews');
      const userReview = {};

      app.get('/allreviews', async(req,res) => {
        const query = {};
        const cursor = serviceCollections.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
      });


      app.post('/reviews', async(req, res) => {
        const review = req.body;
        const result = await serviceCollections.insertOne(review)
        res.send(review);
      })

  }
  finally{

  }

}
reviewApi().catch(error => console.error(error));



app.get('/', (req, res) => {
    res.send('Home Service API running!');
  });

  app.listen(port, () => {
    console.log('Home Service Server running on port', port)
  })