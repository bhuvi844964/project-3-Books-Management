const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const saltRounds = 10;

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isValidbody=function(x){
    return Object.keys(x).length>0
}

// Regex(s) used for the validation of different keys


let nameRegex = /^(?:([A-Za-z]+\ \1)|([A-Za-z]))+$/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
let pinRegex = /^(\d{4}|\d{5}|\d{6})$/
let streetRegex = /^(?:([A-Za-z0-9]+\-\1+[A-Za-z0-9/])|([A-Za-z0-9])|([A-Za-z]+\ \1+[A-Za-z0-9])|([([A-Za-z0-9]+\,\1+[A-Za-z0-9\s]))+$/



const createUser = async function (req, res) {
    try {
        let data = req.body
        if (!isValidbody(data)) return res.status(400).send({ status: false, message: "Provide the data in request body." })

        let { title, name, phone, email, password } = data
        
        if (!isValidTitle(title.trim()) ) 
            return res.status(400).send({ status: false, message: "Please enter the title ('Mr', 'Miss', 'Mrs'). " })

        if (!isValid(name)) 
            return res.status(400).send({ status: false, message: "Please enter the user name. " })
        if (!nameRegex.test(name)) 
            return res.status(400).send({ status: false, message: "name should contain alphabets only. " })

        if (!isValid(phone))  
            return res.status(400).send({ status: false, message: "Please enter the phone number." })
        if (!phoneRegex.test(phone)) 
            return res.status(400).send({ status: false, message: "Enter the phone number in valid Indian format. " })
        let getPhone = await userModel.findOne({ phone: phone });  // --> to check if provided phone number is already present in the database
        if (getPhone) {  // --> if that mobile number is already provided in the database
            return res.status(400).send({ status: false, message: "Phone number is already in use, please enter a new one. " });
        }
        
        if (!isValid(email))  // --> email should be provided in the body
            return res.status(400).send({ status: false, message: "Please enter the email. " })
        if (!emailRegex.test(email))  // --> email should be provided in right format
            return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
        let getEmail = await userModel.findOne({ email: email });  // --> to check if provided email is already present in the database
        if (getEmail) {  // --> if that email is already provided in the database
            return res.status(400).send({ status: false, message: "Email is already in use, please enter a new one " });
        }

        if (!passwordRegex.test(password)) {
            return res
              .status(400)
              .send({
                Status: false,
                message:
                  "Please provide valid AlphaNumeric password having min character 8 ",
              });
          }

            const salt = await bcrypt.genSalt(saltRounds);

            const hashPassword = await bcrypt.hash(password, salt);

            let filter={ title, name, phone, email, password:hashPassword }



            if (data.address) {
            if (!isValidbody(data.address))return res.status(400).send({ status: false, message: "address can't be empty,Plz Enter the street, city and pincode in the address." })
            let c=0
            Object.keys(data.address).forEach(x=>{if(isValid(x) && ["street","city","pincode"].includes(x)) c++})
            if(c==0)return res.status(400).send({ status: false, message: "plz provied all details within [street, city and pincode]" })
            c=0
            Object.values(data.address).forEach(x=>{if(isValid(x)) c++})
            if(c==0)return res.status(400).send({ status: false, message: "Fillup all details [street, city and pincode]" })

            if (!isValid(data.address.street))return res.status(400).send({ status: false, message: "Enter the street" })
            if (!streetRegex.test(data.address.street))return res.status(400).send({ status: false, message: "Enter the street in correct format" })

            if (!isValid(data.address.city))return res.status(400).send({ status: false, message: "Enter the city" })
            if (!nameRegex.test(data.address.city))return res.status(400).send({ status: false, message: "Enter the city in correct format" })

            if (!isValid(data.address.pincode))return res.status(400).send({ status: false, message: "Enter the pincode" })
           
      
            let pinValidated = pinRegex.test(data.address.pincode)
            if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode." })

           
            filter.address=data.address
        }
        
        let userCreated = await userModel.create(filter)
        return res.status(201).send({ status: true, message: 'Success', data: userCreated })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}





const loginAuthor = async function (req, res) {
    try {
      const { email, password } = req.body;
  
      if (!email || email === "") {
        return res
          .status(400)
          .send({ status: false, message: "Please provide email" });
      }
  
      if (!password || password === "") {
        return res
          .status(400)
          .send({ status: false, message: "Please provide password to login" });
      }
  
      const author = await userModel.findOne({ email });
  
      if (!author) {
        return res
          .status(401)
          .send({ status: false, message: "Email is incorrect" });
      }
  
      const matchPassword = await bcrypt.compare(password, author.password);
  
      if (!matchPassword) {
        return res
          .status(401)
          .send({ status: false, message: "Password is incorrect" });
      }
  
      const token = jwt.sign({ authorId: author._id }, process.env.SECRET_KEY, {
        expiresIn: "24h",
      });
  
      res.status(201).send({
        status: true,
        message: "Login successful",
        token,
      });
    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  };
  


module.exports = { createUser,loginAuthor}




