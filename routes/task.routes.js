
const router = require("express").Router();

const Task = require("../models/Task.model");
const Group = require("../models/Group.model");

const { verifyToken } = require("../middlewares/auth.middlewares");

// POST "/api/tasks" => creates a new task
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const {
      title,
      description,
      assignedTo,
      dueDate,
      group,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        errorMessage: "Task title is required.",
      });
    }

    const foundGroup = await Group.findOne({
      _id: group,
      members: req.payload._id,
    });

    if (!foundGroup) {
      return res.status(404).json({
        errorMessage: "Group not found.",
      });
    }

    const newTask = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      completed: false,
      createdBy: req.payload._id,
      group,
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// GET "/api/tasks" => gets all tasks from the user's groups
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const groups = await Group.find({
      members: req.payload._id,
    });

    const groupIds = groups.map((group) => group._id);

    const tasks = await Task.find({
      group: { $in: groupIds },
    });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET "/api/tasks/:taskId" => gets one task
router.get("/:taskId", verifyToken, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    const group = await Group.findOne({
      _id: task.group,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// PUT "/api/tasks/:taskId" => updates a task
router.put("/:taskId", verifyToken, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      assignedTo,
      dueDate,
      completed,
    } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    const group = await Group.findOne({
      _id: task.group,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        assignedTo,
        dueDate,
        completed,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// DELETE "/api/tasks/:taskId" => deletes a task
router.delete("/:taskId", verifyToken, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    const group = await Group.findOne({
      _id: task.group,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});



module.exports = router;