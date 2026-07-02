const crypto = require('crypto');
const {promisify} =require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/User');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict'
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 201, req, res);
});
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //1 check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    //2 check if user exists  && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    //3 If everything ok, send token to client
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict'
    });
    
    // Prevent browser from caching this response
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(200).json({ status: 'success' });
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }
    //2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3) send it to users email
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;
    const message = `Hello,\n\nYou recently requested to reset your password for your ResumeAI account. Please click the link below to set a new password:\n\n${resetURL}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nThanks,\nThe ResumeAI Team`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later!', 500));

    }

});
exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    //2) if token has not expired, and there is user , set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired!', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //3) passwordChangedAt is updated in userModel pre-save hook
    //4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) get user from collection
    const user = await User.findById(req.user.id).select('+password');
    //2) check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current passowrd is wrong', 401))
    }
    //3 If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //user.findbyidandupdate will not work here because middlewares will not work on that
    //4 Log user in, send JWT Token
    createSendToken(user, 200, req, res);
});
