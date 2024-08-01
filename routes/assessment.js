const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchuser = require('../middleware/fetchuser');
const Assessment = require('../models/Assessment');


// Route 1: Get all the assessment using: GET "/api/assessment/fetchallassessment".
router.get('/fetchallassessment', fetchuser, async(req, res) => {
    try {
        const assessment = await Assessment.find({ user: req.user.id });
        res.json(assessment);
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 2: Add a new assessment using: POST "/api/assessment/addassessment".
router.post('/addassessment', fetchuser, [
    body("age", "Enter a valid age").isLength({ min:3 }),
    body("skintype", "Enter a valid skintype").isLength({ min:3 }),
    body("skintone", "Enter a valid skintone").isLength({ min:3 }),
    body("sun", "Enter a valid sun protection info").isLength({ min:3 }),
    body("sleeptime", "Enter a valid sleeptime").isLength({ min:2 }),
    body("skinconcern", "Enter a valid skinconcern").isLength({ min:2 }),
], async (req, res) => {
    try {
        const { age, skintype, skintone, sun, sleeptime, skinconcern } = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({error: errors.array()});
        }

        const assessment = new Assessment({
            age, skintype, skintone, sun, sleeptime, skinconcern, user: req.user.id
        })
        const savedAssessment = await assessment.save();
        res.json(savedAssessment);
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Internal System Error");
    }
})


// Route 3: Delete an existing assessment using: DELETE "/api/assessment/delassessment".
router.delete('/deleteassessment/:id', fetchuser, async(req, res) => {

    try {
        // Find the assessment to be deleted and delete it.
        let assessment = await Assessment.findById(req.params.id);
        if(!assessment) {
            return res.status(404).send("Not Found");
        }

        // Allow deletion only if user owns this assessment
        if(assessment.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        assessment = await Assessment.findByIdAndDelete(req.params.id);
        res.json({ "Success": "assessment has been deleted", assessment: assessment });
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router;