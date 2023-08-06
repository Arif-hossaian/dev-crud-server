import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const uri = process.env.DB_CONNECTION;
const database = process.env.DATABASE_NAME;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//common return statements
const unWantedError = {
  data: [],
  message: 'Something went wrong',
  error: true,
};

//db connect
let db = null;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
try {
  client.connect();
  db = client.db(database);
  console.log('Database connected');
  // return await client
} catch (e) {
  console.error(e);
}


//server running
app.use('/test', async (req, res) => {
  res.send('test');
});


//create a event
app.post(
  '/crt',
  // sessionChecker,
  // permissionChecker,
  async function (req, res) {
    try {
      let data = {
        title: req.body.title,
        description: req.body.description
      };
      await db.collection('Event').insertOne(data);
      let output = {
        data: data,
        error: false,
        message: 'Data create successful',
      };
      return res.status(201).send(output);
    } catch (error) {
      return res.status(500).send(unWantedError);
    }
  }
);


//get events
app.get(
  '/events',
  // sessionChecker,
  // permissionChecker,
  async function (req, res) {
    try {
      let events = await db.collection('Event').find({}).toArray();
      let output = {
        data: events,
        error: false,
        message: 'Get all events',
      };
      return res.status(200).send(output);
    } catch (error) {
      return res.status(500).send(unWantedError);
    }
  }
);


//update event
app.post(
  '/updt/:id',
  // sessionChecker,
  // permissionChecker,
  async function (req, res) {
    try {
      let param = req.params.id;
      //console.log(param);

      let data = {
        title: req.body.title,
        description: req.body.description
      };

      let result = await db
        .collection('Event')
        .updateOne({ _id: ObjectId(param) }, { $set: { ...data } });
      let output = {
        data: { success: true },
        error: false,
        message: 'event update success',
      };
      if (result.acknowledged && result.matchedCount > 0) {
        return res.status(200).send(output);
      } else {
        let output = {
          data: { success: false },
          error: false,
          message: 'event Id is not found',
        };
        return res.status(200).send(output);
      }
    } catch (error) {
      return res.status(500).send(unWantedError);
    }
  }
);



//delete event
app.get(
  '/event/dlt/:id',
  // sessionChecker,
  // permissionChecker,
  async function (req, res) {
    try {
      let param = req.params.id;
      db.collection('Event').deleteOne({ _id: ObjectId(param) });
      return res.status(200).send({
        data: { success: true },
        error: false,
        message: 'Event deleted successfully',
      });
    } catch (err) {
      return res.status(500).send(unWantedError);
    }
  }
);


//server running on port
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server is running on port:- ${PORT}`);
});
