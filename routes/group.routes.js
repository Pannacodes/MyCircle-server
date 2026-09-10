const router = require("express").Router();

const User = require("../models/User.model");

const Group = require("../models/Group.model");
const { verifyToken, verifyGroupOwner, } = require("../middlewares/auth.middlewares");


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

// PUT "/api/groups/:groupId" => updates a group
router.put("/:groupId", verifyToken, verifyGroupOwner, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, generalInfo } = req.body;

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        name,
        generalInfo,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedGroup);
  } catch (error) {
    next(error);
  }
});

// DELETE "/api/groups/:groupId" => deletes a group
router.delete("/:groupId", verifyToken, verifyGroupOwner, async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await Group.findByIdAndDelete(groupId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// POST "/api/groups/:groupId/members" => adds a member
router.post(
  "/:groupId/members",
  verifyToken,
  verifyGroupOwner,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { email } = req.body;

      // Email is required
      if (!email) {
        return res.status(400).json({
          errorMessage: "Email is required.",
        });
      }

      // Finds the user
      const userToAdd = await User.findOne({ email });

      if (!userToAdd) {
        return res.status(404).json({
          errorMessage: "User not found.",
        });
      }

      // Checks if user is already a member
      const group = await Group.findById(groupId);

      const alreadyMember = group.members.some(
        (memberId) => memberId.toString() === userToAdd._id.toString()
      );

      if (alreadyMember) {
        return res.status(400).json({
          errorMessage: "User is already a member of this group.",
        });
      }

      // Adds the user
      group.members.push(userToAdd._id);

      await group.save();

      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE "/api/groups/:groupId/members/:userId" => removes a member
router.delete(
  "/:groupId/members/:userId",
  verifyToken,
  verifyGroupOwner,
  async (req, res, next) => {
    try {
      const { groupId, userId } = req.params;

      const group = await Group.findById(groupId);

      // Checks if the user is a member
      const isMember = group.members.some(
        (memberId) => memberId.toString() === userId
      );

      if (!isMember) {
        return res.status(404).json({
          errorMessage: "User is not a member of this group.",
        });
      }

      // Owners cannot be removed
      const isOwner = group.owners.some(
        (ownerId) => ownerId.toString() === userId
      );

      if (isOwner) {
        return res.status(403).json({
          errorMessage: "Owners cannot be removed from the group.",
        });
      }

      // Removes the member
      group.members = group.members.filter(
        (memberId) => memberId.toString() !== userId
      );

      await group.save();

      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;