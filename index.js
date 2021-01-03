//all the import
var express = require('express')
var mysqlDAO = require('./mysqlDAO')
var mongoDAO = require('./mongoDAO')
var bodyParser = require('body-parser')
const { body, validationResult, check} = require('express-validator')

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

//home page
app.get('/', (req,res) =>{
    res.render("home")

})
//get city page
app.get('/city', (req, res) => {
    //link to mysqlDAO getcity function
    mysqlDAO.getCity()
        .then((result) => {
            //check if it work
            console.log("City OK")
            res.render('city', { cities: result })
        })
        .catch((error) => {
            //show error when the error happen 
            res.send(error)
        })
})
//get country page
app.get('/country', (req, res) => {
    //link to mysqlDAO listCountry function
    mysqlDAO.listCountry()
        .then((result) => {
            //check if country work
            console.log("Country OK")
            res.render('country', { country: result })
        })
        .catch((error) => {
            res.send(error)
        })
})
//get headOfState page
app.get('/headOfState', (req,res)=> {
    //link to mongoDAO getHeadOfState function
    mongoDAO.getHeadOfState()
        .then((documents) => {
            //check if it all ok
            res.render('headOfState', { headsOfStates: documents })
            console.log("heads of state is ok")
            //res.send(documents)
        })
        .catch((error) => {
            //send error when happen
            res.send(error)
        })
})
//get all detail page in city page
app.get('/allDetails/:code', (req, res) => {
    //link with mysql get all detail function
    mysqlDAO.getAllDetail(req.params.code)
        .then((result) => {
            //to check if it ok
            console.log("allDetail OK")
            res.render('allDetail', { allDetail: result })
        })
        .catch((error) => {
            //send error when theres error
            res.send(error)
        })
})
// link to html in headOfState.ejs
app.get('/addHeadOfState', (req, res) => {
    res.render("addHeadOfState", { errors: undefined })
})
//post for update *all the restriction*
app.post('/addHeadOfState',
    [check('_id').isLength({ min: 1, max: 3 }).withMessage("Country Code must not exceed 3 characters or less than 1 character"),
    check('headOfState').isLength({ min: 3 }).withMessage("Head of State must be at least 3 characters"),
    check('_id').exists()
    .custom(async _id => {
        const value = await checkCode(_id);
        if (value) {
            throw new Error('Error: ' + _id + ' is already exist')
        }
    }),
    check('_id')
        .exists()
        .custom(async _id => {
            const value = await checkCountryCode(_id);
            if (value) {
                return true;
            }else
            {
                throw new Error('Error: ' + _id + ' is not exist in mySql Database')
            }
        })
    ],
    (req, res) => {
        //check error
        //if there no error, link to add head of state
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render("addHeadOfState", { errors: errors.errors, _id: req.body._id, headOfState: req.body.headOfState })
            console.log("Error")
        }
        else {
            //if theres error then send it, then redirect to head of state
            mongoDAO.addHeads(req.body._id, req.body.headOfState)
            .then((result) => {
                res.redirect("/headOfState")
            })
            .catch((error) => {
                if (error.message.includes("11000")) {
                    res.send("Error Country code: " + req.body._id + " already exists")
                } else {
                    res.send(error.message)
                }

            })
        }
    })

function checkCode(id){
     //check from mongo only headofstate
    return new Promise((resolve,reject) =>{
        mongoDAO.getHeadOfState()
        .then((result) => {
            result.forEach(country =>{
                if(id == country._id)
                {
                    return resolve(true);
                }
            })
            return resolve(false)
        })
        .catch((error) => {
            return reject(error)
        })
    })
}

function checkCountryCode(id){
    //check from mysql, id of country code when input from head of state and addcountry
    return new Promise((resolve,reject) =>{
        mysqlDAO.listCountry()
        .then((result) => {
            result.forEach(country =>{
                if(id == country.co_code)
                {
                    return resolve(true);
                }
            })
            return resolve(false)
        })
        .catch((error) => {
            return reject(error)
        })
    })
}
//link to add country
app.get('/addCountry', (req, res) => {
    res.render("addCountry", { errors: undefined })
})
//update restriction *Max,Min, etc.*
app.post('/addCountry',
    [check('co_code').isLength({ min: 1, max: 3 }).withMessage("Country Code must not exceed 3 characters or less than 1 character"),
    check('co_name').isLength({ min: 3 }).withMessage("Country Name must be at least 3 characters"),
    check('co_code')
        .exists()
        .custom(async co_code => {
            const value = await checkCountryCode(co_code);
            if (value) {
                throw new Error('Error: ' + co_code + ' is already exist')
            }
        })
    ],
    (req, res) => {
        //check error, if theres one, send
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render("addCountry", { errors: errors.errors })
            console.log("Error in adding new country details")
        }
        
        else {
            mysqlDAO.addCountry(req.body.co_code, req.body.co_name, req.body.co_details)
            res.redirect("/country")
        }
    })
    //link to delete country  
    app.get('/deleteCountry/:country', (req, res) => {
        mysqlDAO.deleteCountry(req.params.country)
            .then((result) => {
                return res.redirect('/country')
                //res.send("OK")             
            })
            .catch((error) => {
                //check if the variable is link to city_table
                //if it is then send error, if not delete it
                if (error.code == "ER_ROW_IS_REFERENCED_2") {
                    res.send("<h3>ERROR: " + error.errno + " cannot delete counry with code: " + req.params.country + " as it has associated city table</h3> <br><br><p> <a href='http://localhost:3004' >HOME</a> </button><p>")
                } else {
                    res.send("<h3>ERROR: " + error.errno + " " + error.sqlMessage + "</h3>")
                }
                res.send(error)
    
            })
    })
    //link to update country
app.get('/updateCountry/:co_code', (req, res) => {
    var code = req.params.co_code
    mysqlDAO.listCountry()
        .then((result) => {
            result.forEach(country => {
                if(code == country.co_code){
                    res.render('updateCountry',{ errors: undefined , co_code:code,co_name:country.co_name, co_details:country.co_details})
                }
            })
        })
})


app.post('/updateCountry/:co_code', 
[
    //check if it has any change in country code
    check('co_code').custom((value, { req }) => {
    console.log('code: ' + req.params.co_code)

        if (value !== req.params.co_code) {
            throw new Error("Sorry cannot update country code")
        } else { return true }
    })
],
(req, res) => {
    var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('updateCountry', { errors:errors.errors, co_code: req.body.co_code, co_name:req.body.co_name, co_details: req.body.co_details })
        } else {
            //link to mysqlDAO to update
            mysqlDAO.updateCountry(req.body.co_name, req.body.co_details, req.body.co_code)
                .then((result) => {
                    res.redirect('/country')
                    res.send("Update country is OK")
                })
                .catch((error) => {
                    res.send(error)
                    console.log("Error in edit country page")
                })
        }
})
//open in port 3004
app.listen(3004, () => {
    console.log("Listening on port 3004")
})