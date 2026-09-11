const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    dueDate: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = model("Task", taskSchema);

module.exports = Task;