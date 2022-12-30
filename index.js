const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("data is coming soon");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const usersCollection = client.db("MediaBook").collection("users");
    const postsCollection = client.db("MediaBook").collection("posts");

    //users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const addedUser = await usersCollection.findOne(query);
      if (addedUser) {
        return res.send({ acknowledged: true });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //user
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });
    app.patch("/user", async (req, res) => {
      const id = req.query.id;
      const updateInfo = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          userName: updateInfo.userName,
          email: updateInfo.email,
          university: updateInfo.university,
          address: updateInfo.address,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //posts
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });

    app.get("/posts", async (req, res) => {
      const query = {};
      const posts = await postsCollection.find(query).sort({postTime: -1}).toArray();
      res.send(posts);
    });

    //top posts
    app.get("/top-post", async (req, res) => {
      const topPost = await postsCollection
        .aggregate([{ $sort: { totalLike: -1 } }])
        .limit(3)
        .toArray();

      res.send(topPost);
    });

    //likes
    app.patch("/likes", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          like: req.body.totalLike,
          totalLike: req.body.totalLike.length,
        },
      };
      const result = await postsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // comments

    app.patch("/comments", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const post = await postsCollection.findOne(query);
      const commentId = new ObjectId();
      const comment = req.body;
      comment.commentId = commentId;

      const previousComment = post.comments;
      const currentComment = [...previousComment, comment];
      const updateDoc = {
        $set: { comments: currentComment },
      };
      const result = await postsCollection.updateOne(query, updateDoc);
      res.send(result);
      // const updateDoc = {
      //     $set: {comments: req.body}
      // }
      // const result = await postsCollection.updateOne(query, updateDoc)
      // res.send(result)
    });
  } catch {}
};
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("server is running on port", port);
});
