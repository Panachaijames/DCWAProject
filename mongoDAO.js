//all the import
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

const dbName = 'headOfStateDB'
const collName = 'headofState'
//variable
var headOfStateDB
var headofState
//connect to mongodb
//have the variable to stored the value of the table in mongo
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then((client) => {
    headOfStateDB = client.db(dbName)
    headofState = headOfStateDB.collection(collName)
})
.catch((error) => {
    //send error
    console.log(error)
})
//function get head of state
//call the function to display table
var getHeadOfState = function()
{
    return new Promise((resolve, reject) => {
        var cursor = headofState.find()
        cursor.toArray()
        .then((documents) =>{
            console.log(documents)
            resolve(documents)
        })
        .catch((error)=> {
            reject(error)
        })
    })
}
//function to add head of state
var addHeadsOfState = function(_id, headOfState) {
    return new Promise((resolve, reject) => {
        headsOfState.insertOne({"_id":_id,"headOfState":headOfState})
        .then((documents) =>{
            resolve(documents)
        })
        .catch((error) =>{
            console.log(error)
            reject(error)
        })
    })
}
//export the function to index
module.exports = {addHeadsOfState,getHeadOfState}