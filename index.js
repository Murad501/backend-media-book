const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.send('data is coming soon')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        const usersCollection = client.db('MediaBook').collection('users')
        const postsCollection = client.db('MediaBook').collection('posts')


        //users
        app.post('/users', async(req, res)=>{
            const user = req.body
            const email = user.email
            const query = {email: email}
            const addedUser = await usersCollection.findOne(query)
            if(addedUser){
                return res.send ({acknowledged:true})
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //posts
        app.post('/posts', async(req, res)=>{
            const post = req.body
            const result = await postsCollection.insertOne(post)
            res.send(result)
        })

        app.get('/posts', async(req, res)=>{
            const query = {}
            const posts = await postsCollection.find(query).toArray()
            res.send(posts)
        })

        app.patch('/posts', async(req, res)=>{
            const id = req.query.id
            console.log(req.body)
            const query = {_id: ObjectId(id)}
            const updateDoc = {
                $set: {like: req.body.totalLike}
            }
            const result = await postsCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        

    }
    catch{

    }
}
run().catch(err => console.log(err))


app.listen(port, ()=>{
    console.log('server is running on port', port)
})