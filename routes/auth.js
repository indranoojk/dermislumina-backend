const express = require('express');
const router = express.Router();
const User = require('../models/User');
// this imports the validationRequest from express-validator
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;


// Route 1: Creating an user using: POST "/api/auth/createuser". 
router.post('/createuser',
 [
    body("name", "Enter a valid name").isLength({ min: 5 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 8 characters").isLength({ min: 8 })
 ],
 async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    // When there is a email entered and that email is already exists in the DB then it will show status 400 (Bad request) and show the error
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()});
    }
    try {
        // Check whether the user with this email exists already
        // By the findOne function it is checking for the specific email in the database if the email already present in the db then it will show status 400
        let user = await User.findOne({ email: req.body.email });
        if(user){
            return res.status(400).json({success, error: "Sorry an user with this email already exists"});
        }

        // Salt will generate some random string
        const salt = await bcrypt.genSalt(10);
        // This secPass will create a new secured password using hashing
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Creating a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({ success, authtoken });
    } catch(error) {
        // catch errors
        console.error(error.message);
        // status code says something is wrong
        res.status(500).send("Internal Server Error")
    }
});


// Route 2: Authenticate an user using: POST "/api/auth/login".
router.post(
    '/login',
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password cannot be blank").exists()
    ], async (req, res) => {
        // If there are errors, return Bad request and the errors
        let success = false;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({error: "Please try to login with correct credentials"});
        }

        // We are taking out email and password from the request body
        const {email, password} = req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({error: "Please try to login with correct credentials"});
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare){
                success = false;
                return res.status(400).json({success, error: "Please try to login with correct credentials"});
            }

            const data = {
                user: {
                    id: user.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            //  This will provide the authentication token to the user
            success = true;
            res.json({success, authtoken});
            
        } catch(error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
)  


// Route 3: Get loggedIn user details using: POST "/api/auth/getuser".
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}
)

// Used to export the router function to the other pages
module.exports = router;