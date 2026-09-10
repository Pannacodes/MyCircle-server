const router = require("express").Router();

const authRouter = require("./auth.routes");
const groupRouter = require("./group.routes");

router.use("/auth", authRouter);
router.use("/groups", groupRouter);


module.exports = router;
