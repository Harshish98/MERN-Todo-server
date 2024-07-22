const { default: mongoose } = require("mongoose");

const ToDo = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TodoModel = mongoose.model("todo", ToDo);

module.exports = TodoModel;
