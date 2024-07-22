const TodoModel = require("../model/todoModel");
const jwt = require("jsonwebtoken");
const UserSchema = require("../model/userModel");

const CreateToDo = async (req, res) => {
  try {
    const { name } = req.body;
    const authHeader = req.headers.authorization;
    // console.log("Authorization Header:", authHeader);
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];
    // console.log("Token: ", token);

    if (!token) {
      return res.status(401).json({
        message: "Token missing from header",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Decoded Token:", decoded);
      // console.log("decoded userID: ", decoded.userId);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const existingUser = await UserSchema.findById(decoded.userId);
    // console.log("Existing User:", existingUser);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const NewTodo = new TodoModel({
      name,
      user: existingUser._id,
    });
    await NewTodo.save();
    existingUser.todos.push(NewTodo._id);
    await existingUser.save();

    res.status(200).json({ NewTodo });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "todo not created",
      error: true,
    });
  }
};

const GetToDo = async (req, res) => {
  try {
    const todoDetails = await TodoModel.find({ user: req.params.id }).sort({
      createdAt: -1,
    });
    // console.log(todoDetails);
    res.status(200).json({ todoDetails });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const DeleteToDo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing from header",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const existingUser = await UserSchema.findByIdAndUpdate(decoded.userId, {
      $pull: { todos: req.params.id },
    });

    if (existingUser) {
      await TodoModel.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Todo Deleted",
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const EditToDo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing from header",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    const existingUser = await UserSchema.findById(decoded.userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const updatedTodo = await TodoModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedTodo) {
      res.status(404).json({
        message: "todo not found",
      });
    }
    res.status(200).json({
      message: "todo updated",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { CreateToDo, GetToDo, DeleteToDo, EditToDo };
