const express = require('express');
const router = express.Router({mergeParams:true}); //mergeParams:true is used to merge the params from the parent router very important for nested routes
const Campground = require("../models/campground");
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require("../models/reviews");
const { isLoggedIn,isReviewAuthor,validateReview } = require('../middleware');
const reviewController = require('../controllers/reviewController');



router.post('/',isLoggedIn,validateReview,catchAsync(reviewController.createReview));


router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviewController.deleteReview));


module.exports = router;