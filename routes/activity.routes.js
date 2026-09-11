const router = require("express").Router();

const Activity = require("../models/Activity.model");
const Group = require("../models/Group.model");

const { verifyToken } = require("../middlewares/auth.middlewares");

// POST "/api/activities" => creates a new activity
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { title, description, category, date, location, group } = req.body;

    if (!title) {
      return res.status(400).json({
        errorMessage: "Activity title is required.",
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

    const newActivity = await Activity.create({
      title,
      description,
      category,
      date,
      location,
      participants: [],
      createdBy: req.payload._id,
      group,
    });

    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
});

// GET "/api/activities" => gets all activities from the user's groups
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const groups = await Group.find({
      members: req.payload._id,
    });

    const groupIds = groups.map((group) => group._id);

    const activities = await Activity.find({
      group: { $in: groupIds },
    });

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
});

// GET "/api/activities/:activityId" => gets one activity
router.get("/:activityId", verifyToken, async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        errorMessage: "Activity not found.",
      });
    }

    const group = await Group.findOne({
      _id: activity.group,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Activity not found.",
      });
    }

    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
});

// PUT "/api/activities/:activityId" => updates an activity
router.put("/:activityId", verifyToken, async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const { title, description, category, date, location } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        errorMessage: "Activity not found.",
      });
    }

    const group = await Group.findOne({
      _id: activity.group,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Activity not found.",
      });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      activityId,
      {
        title,
        description,
        category,
        date,
        location,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json(updatedActivity);
  } catch (error) {
    next(error);
  }
});

// DELETE "/api/activities/:activityId" => deletes an activity
router.delete("/:activityId", verifyToken, async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        errorMessage: "Activity not found.",
      });
    }

    const group = await Group.findOne({
      _id: activity.group,
      members: req.payload._id,
    });

    if (!group) {
      return res.status(404).json({
        errorMessage: "Activity not found.",
      });
    }

    await Activity.findByIdAndDelete(activityId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// POST "/api/activities/:activityId/participants" => joins an activity
router.post(
  "/:activityId/participants",
  verifyToken,
  async (req, res, next) => {
    try {
      const { activityId } = req.params;

      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({
          errorMessage: "Activity not found.",
        });
      }

      const group = await Group.findOne({
        _id: activity.group,
        members: req.payload._id,
      });

      if (!group) {
        return res.status(404).json({
          errorMessage: "Activity not found.",
        });
      }

      const alreadyParticipant = activity.participants.some(
        (participantId) =>
          participantId.toString() === req.payload._id.toString(),
      );

      if (alreadyParticipant) {
        return res.status(400).json({
          errorMessage: "You are already a participant.",
        });
      }

      activity.participants.push(req.payload._id);

      await activity.save();

      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE "/api/activities/:activityId/participants" => leaves an activity
router.delete(
  "/:activityId/participants",
  verifyToken,
  async (req, res, next) => {
    try {
      const { activityId } = req.params;

      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({
          errorMessage: "Activity not found.",
        });
      }

      const group = await Group.findOne({
        _id: activity.group,
        members: req.payload._id,
      });

      if (!group) {
        return res.status(404).json({
          errorMessage: "Activity not found.",
        });
      }

      const isParticipant = activity.participants.some(
        (participantId) =>
          participantId.toString() === req.payload._id.toString(),
      );

      if (!isParticipant) {
        return res.status(400).json({
          errorMessage: "You are not a participant.",
        });
      }

      activity.participants = activity.participants.filter(
        (participantId) =>
          participantId.toString() !== req.payload._id.toString(),
      );

      await activity.save();

      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
