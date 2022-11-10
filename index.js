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
          const services = await cursor.sort({_id:-1}).limit(3).toArray();
          res.send(services);
        });

        app.get('/services/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const service = await serviceCollections.findOne(query);
          res.send(service);
        })

        
        app.post('/addservice', async(req, res) => {
          const addService = req.body;
          const result = await serviceCollections.insertOne(addService)
          res.send(addService);
        })

    }
    finally{

    }

}
run().catch(error => console.error(error));



async function reviewApi(){

  try{
      const serviceCollections = client.db('homeService').collection('reviews');

      app.get('/allreviews', async(req,res) => {
        const query = {};
        const cursor = serviceCollections.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
      });

      app.get('/review/:id', async(req, res) => {
        const id = req.params.id;
        const query = { 
          serviceInfo: id };
        const review = await serviceCollections.find(query).toArray();
        res.send(review);
      })

      
      app.get('/myreviews', async (req, res) => {
        let query = {};

        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }

        const cursor = serviceCollections.find(query);
        const myreviews = await cursor.toArray();
        res.send(myreviews);
      });
      

      app.post('/reviews', async(req, res) => {
        const review = req.body;
        const result = await serviceCollections.insertOne(review)
        res.send(review);
      })


      app.patch('updateReview/:id', async(req, res) => {
        const id = req.params.id;
        const status = req.body.status;
        const query = { _id: ObjectId(id)}
        const newReview = {
          $set:{
            status: status
          }
        }
        const result = await serviceCollections.updateOne(query, newReview)
        res.send(result)
      })

      app.delete('/deleteReview/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id)}
        const result = await serviceCollections.deleteOne(query)
        res.send(result)

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