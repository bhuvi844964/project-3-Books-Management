const express=require('express')
const app=express()


const router = require('./routes/routes')
 app.use(express.json())

 const multer=require('multer');
 app.use(multer().any())
 
 const mongoose=require('mongoose')
 mongoose.connect("mongodb+srv://sharmaji232001:bhuvi844964@cluster0.a2txi.mongodb.net/book-management",
    {useNewUrlParser:true})
    .then(()=>console.log("mongoDB is Connected!!"))
    .catch(err=>console.log(err))

    app.use('/',router)

    app.listen(process.env.PORT||3000,()=>{
        console.log("server connected at Port :",process.env.PORT||3000)
    })
