const express = require('express');
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require("../models/reviews");
const {isLoggedIn, isAuthor,validateCampground} = require('../middleware');
const campgroundController = require('../controllers/campgroundController');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});



router.route('/')
    .get(catchAsync(campgroundController.index))
    .post(isLoggedIn,upload.array('campground[image]'),validateCampground,catchAsync(campgroundController.createCampground));

router.get('/new',isLoggedIn,campgroundController.renderNewForm);

router.route('/:id')
    .get(isLoggedIn,catchAsync(campgroundController.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('campground[image]'),validateCampground,catchAsync(campgroundController.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgroundController.deleteCampground));    

//Edit
router.get('/:id/edit',isLoggedIn,catchAsync(campgroundController.renderEditForm));



module.exports = router;