const User = require('../models/user');
const Passport = require('passport');
const Hotel = require('../models/hotel');
const Order = require('../models/order');

// Express validator
const { check, validationResult } = require('express-validator');

const queryString = require('querystring');

exports.signUpGet = (req, res, next) => {
    res.render('sign_up', { title: 'User sign up' });
}

exports.signUpPost = [
    // Validate data
    check('first_name').isLength({ min: 1 }).withMessage('First name must be specified')
    .isAlphanumeric().withMessage('First name must be alphanumeric'),

    check('last_name').isLength({ min: 1 }).withMessage('Last name must be specified')
    .isAlphanumeric().withMessage('Last name must be alphanumeric'),

    check('email').isEmail().withMessage('Invalid email address'),

    check('confirm_email')
    .custom(( value, { req } ) => value === req.body.email)
    .withMessage('Email addresses do not match'),

    check('password').isLength({ min: 8 }).withMessage('Invalid password, password must be at least 8 characters long'),

    check('confirm_password')
    .custom(( value, { req } ) => value === req.body.password)
    .withMessage('Passwords do not match'),

    check('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            // There is an error
            res.render('sign_up', { title: 'Please fix the following errors:', errors: errors.array() });
            return;
        } else {
            // No error
            const newUser = new User(req.body);
            User.register(newUser, req.body.password, function(err) {
                if(err) {
                    console.log('error while registering', err);
                    return next(err);
                } else {
                    next(); // Move onto logInPost after registering
                }
            });
        };
    }
];

exports.logInGet = (req, res) => {
    res.render('log_in', { title: 'Log in to continue' });
};

exports.logInPost = Passport.authenticate('local', {
    successRedirect: '/',
    successFlash: `You're now logged in`,
    failureRedirect: '/log-in',
    failureFlash: 'Log in failed.'

});

exports.logOut = (req, res) => {
    req.logout();
    req.flash('info', `You're now logged out`);
    res.redirect('/');
};

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.isAdmin) {
        next();
        return;
    }
    res.redirect('/');
};

exports.bookingConfirmation = async (req, res) => {
    try {
        const orderDetails = req.params.orderDetails;
        const orderDetailsJSON = queryString.parse(orderDetails);
        const hotel = await Hotel.find({ _id: orderDetailsJSON.id });
        res.render('confirmation', { title: 'Confirm your booking', hotel, orderDetailsJSON });
    } catch(error) {
        next(error);
    };
};

exports.orderPlaced = async (req, res, next) => {
    try {
        const orderDetails = req.params.orderDetails;
        const parsedOrderDetails = queryString.parse(orderDetails);
        const order = new Order({
            user_id: req.user._id,
            hotel_id: parsedOrderDetails.id,
            order_details: {
                duration: parsedOrderDetails.duration,
                dateOfDeparture: parsedOrderDetails.dateOfDeparture,
                numberOfGuests: parsedOrderDetails.numberOfGuests
            }
        });
        await order.save();
        req.flash('info', 'Your order has been placed');
        res.redirect('/my-account');
    } catch(error) {
        next(error);
    };
};

exports.myAccount = async (req, res, next) => {
    try{
        const userId = String(req.user._id);
        const orders = await Order.aggregate([
            { $match: { user_id: userId } },
            { $lookup: {
                from: 'hotels',
                localField: 'hotel_id',
                foreignField: '_id',
                as: 'hotel_data'
            } }
        ]);
        // res.send(userId);
        // const orders = await Order.find({ user_id: req.user._id });
        // res.json(orders);
        res.render('user_account', { title: 'My account', orders });
    } catch(error) {
        next(error);
    };
};

exports.allOrders = async (req, res, next) => {
    try{
        const orders = await Order.aggregate([
            { $lookup: {
                from: 'hotels',
                localField: 'hotel_id',
                foreignField: '_id',
                as: 'hotel_data'
            } }
        ]);
        res.render('orders', { title: 'All orders', orders });
    } catch(error) {
        next(error);
    };
};