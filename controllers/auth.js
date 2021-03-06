const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/UserDetails');

//  @desc       Register user
//  @route      POST /api/v1/auth/register
//  @access     Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sentTokenResponse(user, 200, res);
});

//  @desc       Register user
//  @route      POST /api/v1/auth/login
//  @access     Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //check for user
  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  //check if password matches
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sentTokenResponse(user, 200, res);
});

//  @desc       Get current logged in user
//  @route      GET /api/v1/auth/me
//  @access     Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  @desc       forgot password
//  @route      POST /api/v1/auth/forgotpassword
//  @access     Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  //get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or some else) has requested the rest of a password.please make a PUT request to: n\n\ ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset Token',
      message,
    });

    res.status(200).json({
      success: true,
      data: 'email sent',
    });
  } catch (error) {
    console.log('error');
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined);

    await user.save({
      validateBeforeSave: false,
    });
    return next(new ErrorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//get token from model, create cookie and send respone
const sentTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
