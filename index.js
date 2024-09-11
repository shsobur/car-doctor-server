import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g4yea9q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection


    const servicesCollection = client.db("carDoctor").collection("services");
    const bookingCollection = client.db("carDoctor").collection("bookings");



    // jwt__
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token=  jwt.sign(user, "secret", { expiresIn: '1h' });
      res.send(token);
    })

    // Get all service data in one time__
    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    })

    // Get data of a spacie id useing "Options" to load few value of a data__
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options = {
        projection: {
          title: 1,
          price: 1,
          img: 1,
        }
      }
      const result = await servicesCollection.findOne(query, options);
      res.send(result);
    })

    // Post oparation for bookings__
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    // Get oparation for bookings__
    app.get("/bookings", async (req, res) => {
      let qurey = {};
      if(req.query?.email) {
        qurey = {email: req.query.email}
      }
      const result = await bookingCollection.find(qurey).toArray();
      res.send(result);
    })

    //Delete oparation for booking__
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get("/", (req, res) => {
  res.send("Car Doctor Server is running");
})

app.listen(port, () => {
  console.log(`The server is running on  ${port} _PORT`)
})