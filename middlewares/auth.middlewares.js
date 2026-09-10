const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Gets the Authorization header
  const authHeader = req.headers.authorization;

  // Checks that a token was provided
  if (!authHeader) {
    return res.status(401).json({
      errorMessage: "Authorization token is required",
    });
  }

  // Gets the token from "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  try {
    // to verify the token
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    // Adds the payload to the request
    req.payload = payload;

    // Continues to the next middleware/route
    next();
  } catch (error) {
    return res.status(401).json({
      errorMessage: "Invalid or expired token",
    });
  }
};

const verifyGroupOwner = async (req, res, next) => {
  try {
    const Group = require("../models/Group.model");

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        errorMessage: "Group not found.",
      });
    }

    const isOwner = group.owners.some(
      (ownerId) => ownerId.toString() === req.payload._id.toString()
    );

    if (!isOwner) {
      return res.status(403).json({
        errorMessage: "Only group owners can perform this action.",
      });
    }

    req.group = group;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  verifyGroupOwner,
};