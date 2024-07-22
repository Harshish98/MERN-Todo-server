const UserSchema = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const CreateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (![name, email, password].every((val) => val?.trim())) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
        error: true,
      });
    }

    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already in use",
        success: false,
        error: true,
      });
    }

    const encPassword = await bcrypt.hash(password, 2);
    const newUser = new UserSchema({
      name,
      email,
      password: encPassword,
    });
    await newUser.save();
    res.status(201).json({
      status: "success",
      message: "user created successfully",
      data: newUser,
      token: await newUser.generateToken(),
      error: false,
    });
  } catch (error) {
    console.log(error),
      res.status(500).json({
        status: "error",
        message: "user not created",
        error: true,
      });
  }
};

const UserLogin = async (req, res) => {
  const { email, password } = req.body;
  const userExist = await UserSchema.findOne({ email });
  try {
    if (!userExist) {
      res.status(404).json({
        status: "error",
        message: "invalid credentials",
        error: true,
      });
    }
    const passMatch = await bcrypt.compare(password, userExist.password);
    if (!passMatch) {
      res.status(404).json({
        status: "error",
        message: "invalid credentials",
        error: true,
      });
    }
    const token = await userExist.generateToken();
    res.status(200).json({
      status: "success",
      message: "user login successfully",
      data: userExist._id,
      token: token,
      error: false,
    });
  } catch (error) {
    console.log(error);
  }
};

const ForgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.send({
        message: "User not existed",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: user.email,
      subject: "Reset Password Link",
      text: `http://localhost:3000/reset/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.send({ Status: "Failed to send email" });
      } else {
        return res.send({ Status: "Success", token: token, message: info });
      }
    });
  } catch (err) {
    res.send({ Status: err.message });
  }
};

const ResetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id !== id) {
      return res.json({
        Status: "Error with token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const user = await UserSchema.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      res.send({ Status: "Success" });
    } else {
      res.send({ Status: "User not found" });
    }
  } catch (error) {
    res.json({ Status: "Error with token", Error: error.message });
  }
};

const ProfileDetails = async (req, res) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).send("Access denied");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserSchema.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  CreateUser,
  UserLogin,
  ForgetPassword,
  ResetPassword,
  ProfileDetails,
};
