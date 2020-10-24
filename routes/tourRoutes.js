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
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

//================================================================
/*
  POST /tours/21212/reviews/
  GET /tour/21221/reviews/
  GET /tour/212/reviews/12121
*/

router.use('/:tourId/reviews', reviewRouter);

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

module.exports = router;
