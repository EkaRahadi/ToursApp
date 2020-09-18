const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  // checkID,
  // checkBody,
} = require('../controllers/tourControllers');

const router = express.Router();

//Params middleware
// router.param('id', checkID);

// router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
