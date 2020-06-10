var express = require('express');
var router = express.Router();

// require controllers
const hotelController = require('../controllers/hotelController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', hotelController.homePageFilters);

router.get('/all', hotelController.listAllHotels);
router.get('/all/:hotelId', hotelController.hotelDetail);
router.get('/countries', hotelController.listAllCountries);
router.get('/countries/:country', hotelController.hotelsByCountry);
router.post('/results', hotelController.searchResults);

// ADMIN routes:
router.get('/admin', userController.isAdmin, hotelController.adminPage);
router.get('/admin/*', userController.isAdmin);
router.get('/admin/add', hotelController.createHotelGet);
router.post(
    '/admin/add',
    hotelController.upload,
    hotelController.pushToCloudinary,
    hotelController.createHotelPost
    );
router.get('/admin/edit-remove', hotelController.editRemoveGet);
router.post('/admin/edit-remove', hotelController.editRemovePost);
router.get('/admin/:hotelId/update', hotelController.updateHotelGet);
router.post(
    '/admin/:hotelId/update',
    hotelController.upload,
    hotelController.pushToCloudinary,
    hotelController.updateHotelPost
    );
router.get('/admin/:hotelId/remove', hotelController.removeHotelGet);
router.post('/admin/:hotelId/remove', hotelController.removeHotelPost);
router.get('/admin/orders', userController.allOrders);

// USER routes:
router.get('/sign-up', userController.signUpGet);
router.post('/sign-up', userController.signUpPost, userController.logInPost);

router.get('/log-in', userController.logInGet);
router.post('/log-in', userController.logInPost);

router.get('/log-out', userController.logOut);

router.get('/my-account', userController.myAccount);

// ordering:
router.get('/confirmation/:orderDetails', userController.bookingConfirmation)
router.get('/order-placed/:orderDetails', userController.orderPlaced);


module.exports = router;
