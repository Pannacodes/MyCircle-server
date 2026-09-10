const router = require("express").Router();

const Group = require("../models/Group.model");
const { verifyToken } = require("../middlewares/auth.middlewares");


// POST "/api/groups" => creates a new group
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { name, generalInfo, enabledModules } = req.body;

    // Group name is required
    if (!name) {
      return res.status(400).json({
        errorMessage: "Group name is required.",
      });
    }

    // Creates the group
    const newGroup = await Group.create({
      name,
      generalInfo,
      enabledModules,
      owners: [req.payload._id],
      members: [req.payload._id],
    });

    res.status(201).json(newGroup);
  } catch (error) {
    next(error);
  }
});

// GET "/api/groups" => gets all groups of the logged-in user
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const groups = await Group.find({
      members: req.payload._id,
    });

    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
});

// GET "/api/groups/:groupId" => gets one group
router.get("/:groupId", verifyToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({
      _id: groupId,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Group not found.",
      });
    }

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
});

module.exports = router;