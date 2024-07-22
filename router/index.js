const express = require("express");
const {
  CreateToDo,
  GetToDo,
  DeleteToDo,
  EditToDo,
} = require("../controller/todoController");
const {
  CreateUser,
  UserLogin,
  ForgetPassword,
  ResetPassword,
  ProfileDetails,
} = require("../controller/userController");

const router = express.Router();

router.post("/create-todo", CreateToDo);
router.get("/get-todo/:id", GetToDo);
router.delete("/delete-todo/:id", DeleteToDo);
router.put("/edit-todo/:id", EditToDo);
router.post("/user-signup", CreateUser);
router.post("/user-login", UserLogin);
router.post("/forget-password", ForgetPassword);
router.post("/reset-password/:id/:token", ResetPassword);
router.get("/user-profile", ProfileDetails);

module.exports = router;
