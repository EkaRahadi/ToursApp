const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protectRoute, reviewController.getAllReview)
  .post(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
