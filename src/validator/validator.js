
// a function is defined to validate the data provided in the request body
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}
const isvalidString=function(x){
    if(typeof x==="string" && x.trim().length===0) return false
    return true  
}

const isValidbody=function(x){
    return Object.keys(x).length>0
}

// Regex(s) used for the validation of different keys


let nameRegex = /^(?:([A-Za-z]+\ \1)|([A-Za-z]))+$/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passRegex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
let pinRegex = /^(\d{4}|\d{5}|\d{6})$/
let streetRegex = /^(?:([A-Za-z0-9]+\-\1+[A-Za-z0-9/])|([A-Za-z0-9])|([A-Za-z]+\ \1+[A-Za-z0-9])|([([A-Za-z0-9]+\,\1+[A-Za-z0-9\s]))+$/
let titleRegex = /^(?:([A-Za-z0-9]+\-\1+[A-Za-z0-9/])|([A-Za-z])|([A-Za-z]+\ \1+[A-Za-z0-9])|([([A-Za-z0-9]+\,\1+[A-Za-z0-9\s]))+$/
let checkISBN= /^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/



module.exports = { isValid, isValidTitle,isvalidString,  nameRegex, emailRegex, phoneRegex, passRegex,isValidbody,pinRegex,streetRegex,checkISBN,titleRegex}  // --> exporting the variables defined in the module
