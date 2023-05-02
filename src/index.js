const express=require('express')
const app=express()
require('dotenv').config()

const router = require('./routes/routes')
 app.use(express.json())

 const multer=require('multer');
 app.use(multer().any())
 
 const mongoose=require('mongoose')
 mongoose.connect(process.env.URL.toString(),
    {useNewUrlParser:true})
    .then(()=>console.log("mongoDB is Connected!!"))
    .catch(err=>console.log(err))

    app.use('/',router)


    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send("Oops, something went wrong.");
      });

    app.listen(process.env.PORT||3000,()=>{
        console.log("server connected at Port :",process.env.PORT||3000)
    })
