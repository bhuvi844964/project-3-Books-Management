const express=require("express")
const router=express.Router()
const {createbook,getBooks,getBooksById,updatedetails,deletebook,bookcover}=require("../controller/bookController")
const {createUser,loginAuthor}=require("../controller/userController")
const {addReview,updateReview,deleteReview}=require("../controller/reviewController")
const {authentication,authorisation}=require("../middleware/auth")

// ========================================User================================================

router.post("/register",createUser)
router.post("/login",loginAuthor)

// ========================================Book================================================

router.post('/aws',bookcover)
router.post("/books",authentication,authorisation,createbook)
router.get("/books",authentication,getBooks)
router.get("/books/:bookId",authentication,getBooksById)
router.put("/books/:bookId",authentication,authorisation,updatedetails)
router.delete("/books/:bookId",authentication,authorisation,deletebook)

// ========================================Review================================================

router.post("/books/:bookId/review",addReview)
router.put('/books/:bookId/review/:reviewId', updateReview)
router.delete('/books/:bookId/review/:reviewId', deleteReview)


//url checking 

router.post("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})
router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})
router.put("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.delete("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})


module.exports=router
