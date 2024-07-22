const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserData = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    todos: [
      {
        type: mongoose.Types.ObjectId,
        ref: "todo",
      },
    ],
    token:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

UserData.methods.generateToken = function() {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const UserSchema = mongoose.model("user", UserData);

module.exports = UserSchema;
