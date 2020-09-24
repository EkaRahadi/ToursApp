const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  newUser.password = undefined;

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1)Check if email / password is exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2). Check if user exist and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3). If everything is ok
  user.password = undefined;
  const token = signToken(user._id);
  res.status(200).json({
    success: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) Get token from request if exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not login. Please login to get access.', 401)
    );
  }
  //2) Validate that token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //3)Check if user still exist
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return new AppError(
      'The user belonging to this token does not longer exist.',
      401
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return new AppError(
      'User recently changed password! Please login again.',
      401
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles = ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  //2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid 10 minutes)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email !',
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired, and there is user. then set the new passwordConfirm
  if (!user) {
    return next(new AppError('Token is invalid or has expired !', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)Update changedPasswordAt property for the user with -> already did in behind the scene on instance methode in usermodel
  //4) log the user in, send JWT
  const token = signToken(user._id);
  user.password = undefined;
  res.status(200).json({
    success: 'success',
    token,
    data: {
      user,
    },
  });
});
