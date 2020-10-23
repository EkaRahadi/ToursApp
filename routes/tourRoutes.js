const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  // checkID,
  // checkBody,
} = require('../controllers/tourControllers');

const { protectRoute, restrictTo } = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

//Params middleware
// router.param('id', checkID);

// router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/').get(protectRoute, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protectRoute, restrictTo('admin', 'lead-guide'), deleteTour);

//================================================================
/*
  POST /tours/21212/reviews/
  GET /tour/21221/reviews/
  GET /tour/212/reviews/12121
*/

router
  .route('/:tourId/reviews')
  .post(protectRoute, restrictTo('user'), reviewController.createReview);

module.exports = router;
