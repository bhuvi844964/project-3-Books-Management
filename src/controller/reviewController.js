const mongoose=require('mongoose')
const reviewModel=require("../models/reviewModel")
const bookModel=require("../models/bookModel")
const { isValid, isValidbody,nameRegex } = require("../validator/validator")

/******************************************************Add Review API*****************************************/


const addReview=async function(req,res){
try{
     let obj={}
    let book_id=req.params.bookId
    
    if (!mongoose.isValidObjectId(book_id)) {
        return res.status(400).send({ status: false, message: "Invalid BookId." })
    }
    let checkBook=await bookModel.findOne({_id:book_id,isDeleted:false}).lean()
    
    if(!checkBook){
        return res.status(404).send({ status: false, message: "Book Not Found" })
    }
    let data=req.body
    if(!isValidbody(data)){ 
        return res.status(400).send("Please enter the review Details") 
   }

    if(Object.keys(data).includes("reviewedBy")){
     if(isValid(data.reviewedBy)){
        // return res.status(400).send({ status: false, message:"Reviewer can't be empty"})  
    if (!nameRegex.test (data.reviewedBy)) {
        return res.status(400).send({ status: false, message: "Enter reviwedBy in correct format" }) 
    }
    obj.reviewedBy=data.reviewedBy
}
}
    
    if(!isValid(data.rating)){
        return res.status(400).send({ status: false, message: "Rating must be present" })
    }

    if (!(data.rating >= 1 && data.rating <= 5)) {
        return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
    }

    if(!isValid(data.review)){
        return res.status(400).send({ status: false, message: "Review must be present" })
    }
    
    obj={...obj,rating:data.rating,review:data.review,bookId:checkBook._id,reviewedAt:new Date()}

    let saveReview=await reviewModel.create(obj)

    if (saveReview) {
        await bookModel.findOneAndUpdate({ _id: saveReview.bookId }, { $inc: { reviews: 1 } })
    }

    const reviewDetails = await reviewModel.findOne({ _id: saveReview._id}).select({__v: 0,createdAt: 0,updatedAt: 0,isDeleted: 0})
    
    // checkBook.reviewsData=reviewDetails

    res.status(201).send({ status: true, message: "review created successfully", data: reviewDetails })
}
catch(err){
    res.status(500).send({ status: false, message: err.message })
}
}

/******************************************************Update Review API*****************************************/





const updateReview=async (req,res)=>{
    try{
    const bookId=req.params.bookId
    const reviewId=req.params.reviewId
    let data=req.body
    const{review,rating,reviewedBy}=data
    let obj={}

    if (!mongoose.isValidObjectId(reviewId.toString())) {
        return res.status(400).send({ status: false, message: "reviewId is not valid" })
    }
    const reviewCheck=await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!reviewCheck){
        return res.status(404).send({status:false, message: `Review not found.`})
    }
    if (!mongoose.isValidObjectId(bookId.toString())) {
        return res.status(400).send({ status: false, message: "bookId is not valid" })
    }
    const bookCheck=await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!bookCheck){
        return res.status(404).send({status:false, message: `Book not found.`})
    }
    

    if (isValid(review)) {
        obj.review=review
    }
if(rating){
    if (!(data.rating >= 1 && data.rating <= 5)) {
    return res.status(400).send({ status: false, message: "plz enter rating from 1 to 5" })
  }
  obj.rating=rating
}

    if (isValid(reviewedBy)) {
        if (!nameRegex.test (data.reviewedBy)) {
            return res.status(400).send({ status: false, message: "Enter reviewedBy name in correct format" }) 
        }
        obj.reviewedBy=reviewedBy
    }
    if(!isValidbody(obj))return res.status(400).send({ status: false, message: "Provide data to update [reviewedBy,rating,review]" }) 
    
    if (bookId != reviewCheck.bookId) {
        return res.status(404).send({status:false, msg: "This review not belongs to this particular book."})
     }

    const updateReview=await reviewModel.findOneAndUpdate({_id:reviewId,isDeleted:false},obj,{new:true})
        res.status(200).send({ status: true,data:updateReview })


    }catch(err){
        res.status(500).send({ status: false,message:err.message })

    }
}

/******************************************************Delete Review API*******************************************/


const deleteReview=async function(req,res){
    
    try{
        let reviewId=req.params.reviewId
        let bookId=req.params.bookId

        if(!mongoose.isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"Please Enter The Valid bookId "})
       }
       let bookDetail=await bookModel.findOne({_id:bookId,isDeleted:false})
       if(!bookDetail) return res.status(404).send({status:false,message:"Sorry:Book not found 😢"})
        
        if(!mongoose.isValidObjectId(reviewId)){
            return res.status(400).send({status:false,message:"Please Enter The Valid ReviewId "})}
        let reviewCheck=await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!reviewCheck) return res.status(404).send({status:false,message:"Sorry:Review not Found 😢"})

        let deletedReview=await reviewModel.findOneAndUpdate({_id:reviewId,isDeleted:false,bookId:bookId},{isDeleted:true,deletedAt:new Date()})
        if(!deletedReview){
            return res.status(400).send({status:false,message:"This review not belongs to this particular book."})
        }
        await bookModel.updateOne({_id:bookId},{$inc: { reviews: -1 }})
        return res.status(200).send({status:true,massage:"Delete successful 👍"})

    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})

    }

}




module.exports = { addReview,updateReview,deleteReview};
