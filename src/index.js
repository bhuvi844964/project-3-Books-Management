const express=require('express')
const app=express()

const bodyparser=require('body-parser')
const router = require('./routes/routes')
 app.use(bodyparser.json())

 const multer=require('multer');
 app.use(multer().any())
 
 const mongoose=require('mongoose')
 mongoose.connect("mongodb+srv://atifpervez:34BmDa5XVvtznQvO@code.8mvlc.mongodb.net/group17-DB",
    {useNewUrlParser:true})
    .then(()=>console.log("mongoDB is Connected!!"))
    .catch(err=>console.log(err))

    app.use('/',router)

    app.listen(process.env.PORT||3000,()=>{
        console.log("server connected at Port :",process.env.PORT||3000)
    })
