const router = require("express").Router();

const authRouter = require("./auth.routes");
const groupRouter = require("./group.routes");
const taskRouter = require("./task.routes");

router.use("/auth", authRouter);
router.use("/groups", groupRouter);
router.use("/tasks", taskRouter);


module.exports = router;
