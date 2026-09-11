const router = require("express").Router();

const authRouter = require("./auth.routes");
const groupRouter = require("./group.routes");
const taskRouter = require("./task.routes");
const activityRouter = require("./activity.routes");

router.use("/auth", authRouter);
router.use("/groups", groupRouter);
router.use("/tasks", taskRouter);
router.use("/activities", activityRouter);


module.exports = router;
