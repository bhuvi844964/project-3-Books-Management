const { isValid, isValidbody } = require("../validator/validator")
const mongoose = require("mongoose")
const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")
const moment = require('moment')
const {checkISBN,titleRegex}=require("../validator/validator")
const aws= require("aws-sdk")



aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    let s3= new aws.S3({apiVersion: '2006-03-01'}); 

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "abc/" + file.originalname,  
        Body: file.buffer
    }

    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        return resolve(data.Location)
    })
})
}



//AWS configaration

const bookcover=async (req,res)=>{
    try{
        let files=req.files

        if (!(files&&files.length)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image" });}

        const uploadedBookImage = await uploadFile(files[0])

       
        return res.status(201).send({ status: true, data: uploadedBookImage})

    }catch(err){
        return res.status(500).send({ status: false, message:err.message })

    }
}


// ============================================createBook===================================================
const createbook = async function (req, res) {
    try {
        let data = req.body
        let { title, excerpt, userId, ISBN, category, subcategory,releasedAt } = data
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, message: "body can't be empty" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "plz enter title" })
        }
        
        const titleCheck = await bookModel.findOne({ title })
        if (titleCheck) return res.status(400).send({ status: false, message: "title alraedy exist" })

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "plz enter excerpt" })
        }


        if (req.isValidUserId === null) {
            return res.status(400).send({ status: false, message: "plz enter userId" })
        }
        if (req.isValidObjectId === null) {
            return res.status(400).send({ status: false, message: "plz enter Valid userID" })
        }
        if (req.userDetails === null) return res.status(404).send({ status: false, message: "user not exist" })



        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "plz enter ISBN" })
        }
        if(!checkISBN.test(ISBN)) return res.status(400).send({ status: false, message: "plz enter valid ISBN format" })
        const ISBNCheck = await bookModel.findOne({ ISBN })
        if (ISBNCheck) return res.status(400).send({ status: false, message: "ISBN alraedy exist" })

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "plz enter category" })
        }


        // if(!subcategory)return res.status(400).send({ status: false, message: "plz enter subcategory" })
        if (Array.isArray(subcategory)) {
            let arr = []
            if (subcategory.length === 0) {
                return res.status(400).send({ status: false, message: "subcategory can not be empty array" })
            }
            subcategory.forEach(x => {
                if (isValid(x)) {
                    arr.push(x)
                }
            })
            if (arr.length === 0) {
                return res.status(400).send({ status: false, message: "subcategory can not be empty array" })
            }
            data["subcategory"] = [...arr]
            //it's checking subcategory as a string
        } else if (isValid(subcategory)) {

            data["subcategory"] = subcategory.trim()
        } else {
            return res.status(400).send({ status: false, message: "plz enter subcategory" })
        }


        if (releasedAt) {
            if (!moment(releasedAt, "YYYY-MM-DD", true).isValid()){
                return res.status(400).send({
                    status: false,
                    message: "Enter a valid date with the format (YYYY-MM-DD).",
                });}
        } else releasedAt = new Date()
        
        let obj = { title, excerpt, userId, ISBN, category, subcategory, releasedAt }


        const book = await bookModel.create(obj)
        return res.status(201).send({ status: true, data: book })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}


// ============================================getBookByQuery===================================================


const getBooks = async function (req, res) {

    try {
        let query = req.query
        let { userId, subcategory, category } = query

        let obj = {}

        if (isValid(userId)) {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).send({ status: false, message: "plz enter Valid userID" })

            }
            obj.userId = userId
        }

        if (isValid(category)) {
            obj.category = category
        }

        //it's checking subcategory as a string

        if (isValid(subcategory)) {
            let a = subcategory.trim().split(",").map(x => x.trim())
            obj.subcategory = { $all: a }
        }

        const books = await bookModel.find({ ...obj, isDeleted: false }).select({ createdAt: 0, updatedAt: 0, __v: 0, subcategory: 0, isDeleated: 0,ISBN:0}).sort({title:1})
        if (!books.length) {
            return res.status(404).send({ status: false, message: "there is no book found" })

        }
        return res.status(200).send({ status: true,message: 'Books list', data: books })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


// ============================================getBookById===================================================


const getBooksById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is not valid" })
        }

        let allbooks = await bookModel.findOne({ _id: bookId, isDeleted: false }).lean().select({ __v: 0 })
        if (!allbooks) {
            return res.status(400).send({ status: false, message: "books not found" })

        }
        let review = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ createdAt: 0, updateAt: 0, __v: 0 })




        //   let r=await internModel.find({collegeId:collegeId},{_id:1,updatedAt:0,createdAt:0,isDeleted:0,__v:0,collegeId:0}).lean()
        allbooks.reviewsData = [...review]

        //   console.log(allbooks.reviewsData)
        //   console.log(allbooks)
        return res.status(200).send({ status: true, message: 'Books list',data: allbooks })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }

}


// ============================================updateBook===================================================


const updatedetails = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const requestbody = req.body
        let { title, excerpt, releasedAt, ISBN } = requestbody

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Id is not valid" })
        }

        if (!isValidbody(requestbody)) {
            return res.status(400).send({ status: false, message: "body can't be empty " })
        }
        // it's checking whether id given or not
        // if(!isvalid(data)){
        //     return res.status(400).send({ status: false, message: "plz dont provide empty Id params" })
        // }
        //id is checking whether valid or not





        let obj = {}

        if (isValid(title)) {
            title = title.trim()
            const titleCheck = await bookModel.findOne({ title }) ///here checking title that duplicate or not
            if (titleCheck) return res.status(400).send({ status: false, message: "title already exist" })
            obj.title = title

        }
        if (isValid(excerpt)) {
            obj.excerpt = excerpt.trim()
        }
        if (isValid(releasedAt)) {
                if (!moment(releasedAt, "YYYY-MM-DD", true).isValid())
                    return res.status(400).send({status: false,message: "Enter a valid date with the format (YYYY-MM-DD)."});
            obj.releasedAt = releasedAt.trim()    
        }
        if (isValid(ISBN)) {
            ISBN = ISBN.trim()
        if(!checkISBN.test(ISBN)) return res.status(400).send({ status: false, message: "plz enter valid ISBN" })
            

            const ISBNCheck = await bookModel.findOne({ ISBN })
            if (ISBNCheck) return res.status(400).send({ status: false, message: "ISBN already exist" })
            obj.ISBN = ISBN
        }
        if (!isValidbody(obj)) {
            return res.status(400).send({ status: false, message: "you can update by only ISBN,releaseAt,title,excerpt" })
        }



        let updateBook = await bookModel.findByIdAndUpdate(bookId, obj, { new: true })
        res.status(200).send({ status: false,message: 'Success', data: updateBook })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}


// ============================================deleteBook===================================================


const deletebook = async function (req, res) {
    try {
        let idparams = req.params.bookId
        if (!mongoose.isValidObjectId(idparams)) {
            return res.status(400).send({ status: false, message: "Id is not valid" })
        }
        let deletedbook = await bookModel.findOneAndUpdate({ _id: idparams, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (!deletedbook) {
            return res.status(404).send({ status: false, message: "no book found" })
        }
        return res.status(200).send({ status: true,message: "Success" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}



module.exports = { createbook, getBooks, getBooksById, updatedetails, deletebook,bookcover }
