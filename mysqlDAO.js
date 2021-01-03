//All the import
const { resolve } = require('promise');
var mysql = require('promise-mysql');
//variable
var pool
//connect to mysql & check for error
mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'panachai1',
    database: 'geography'
})
    .then((result) => {
        pool = result
    })
    .catch((error) => {
        console.log(error)
    });
//function for display the table for city
    var getCity = function () {
        return new Promise((resolve, reject) => {
            //mysql command
            pool.query('select * from city')
                .then((result) => {
                    resolve(result)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
    //function for display table for country
    var listCountry = function () {
        return new Promise((resolve, reject) => {
            //mysql command
            pool.query('select * from country')
                .then((result) => {
                    resolve(result)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
    //display all detail for that city
    //find it on city page last column
    var getAllDetail = function(cty_code) {
        return new Promise((resolve, reject) =>{
            var myQuery = {
                //mysql command
                sql: "SELECT * FROM city LEFT JOIN country ON city.co_code = country.co_code WHERE cty_code = ?",
                values: [cty_code]
            }
            pool.query(myQuery)
            .then((result) => {
                resolve(result)
    
            })
            .catch((error) =>{
                reject(error)
            })
        })
    }
    //function to add country
    var addCountry = function(co_code, co_name, co_details){
        return new Promise((resolve, reject) => {
            var myQuery = {
                //mysql command
                sql: "INSERT INTO country VALUES( ?, ?, ?)",
                values: [co_code, co_name, co_details]
            }
            pool.query(myQuery)
            .then((result) => {
                resolve(result)
    
            })
            .catch((error) =>{
                reject(error)
            })
        })
    }
    //function to delete country
    var deleteCountry = function(co_code) {
        return new Promise((resolve, reject) => {
            var myQuery = {
                //mysql command
                sql: 'delete from country where co_code = ?',
                values: [co_code]
            }
            pool.query(myQuery)
            .then((result) => {
                resolve(result)
    
            })
            .catch((error) =>{
                reject(error)
            })
        })
    }
    //function to update country
    var updateCountry = function(co_code,co_name, co_details) {
        return new Promise((resolve, reject) =>{
            var myQuery = {
                //mysql command
                sql: 'UPDATE country SET co_name=?, co_details=? WHERE co_code=?',
                values:[co_code,co_name, co_details]
            }
            pool.query(myQuery)
            .then((result) => {
                resolve(result)
    
            })
            .catch((error) =>{
                reject(error)
            })
        })
    }
    //export to index
    module.exports = {updateCountry,deleteCountry,getAllDetail,getCity, listCountry, addCountry }