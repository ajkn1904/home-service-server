require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')


const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;



app.use(cors(
  {
    origin : '*'
  }
  ));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7splzic.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyToken(req, res, next){
  const authHeader = req.headers.authorization;

  if(!authHeader){
      return res.status(401).send({message: 'Unauthorized access!'});
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.HOMESERVICE_TOKEN, function(error, decoded){
      if(error){
          return res.status(403).send({message: 'Forbidden access!'});
      }
      req.decoded = decoded;
      next();
  })
}



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

      
      app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.HOMESERVICE_TOKEN, {expiresIn: '12hr'})
        res.send({token})
      })


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
        const review = await serviceCollections.find(query).sort({_id:-1}).toArray();
        res.send(review);
      })

      app.get('/specificReview/:id', async(req, res) => {
        const id = req.params.id;
        const query = { 
          _id: ObjectId(id) };
        const spreview = await serviceCollections.findOne(query);
        res.send(spreview);
      })

      
      app.get('/myreviews', verifyToken, async (req, res) => {
        const decoded = req.decoded
        console.log('inside Api', decoded)
        if(decoded.email !== req.query.email){
          res.status(403).send({message: 'unauthorized access'})
        }
        
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


      app.put('/updateReview/:id', verifyToken, async(req, res) => {
        const id = req.params.id;
        const status = req.body.status;
        const query = { _id: ObjectId(id)}
        
        const option = {upsert: true};
        const newReview = {
          $set:{
            text: status
          }
        }
        console.log(newReview)
        const result = await serviceCollections.updateOne(query, newReview, option)
        res.send(result)
      })

      app.delete('/deleteReview/:id', verifyToken, async(req, res) => {
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