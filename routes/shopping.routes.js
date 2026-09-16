const express = require("express");
const router = express.Router();

const Shopping = require("../models/Shopping.model");
const { verifyToken } = require("../middlewares/auth.middlewares");

// POST "/api/shopping" => creates a shopping item
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { name, group } = req.body;

    if (!name || !group) {
      return res.status(400).json({
        errorMessage: "Name and group are required.",
      });
    }

    const shoppingItem = await Shopping.create({
      name,
      group,
      createdBy: req.payload._id,
    });

    res.status(201).json(shoppingItem);
  } catch (error) {
    next(error);
  }
});

// GET "/api/shopping" => gets shopping items
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const { group } = req.query;

    const filter = group ? { group } : {};

    const shoppingItems = await Shopping.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(shoppingItems);
  } catch (error) {
    next(error);
  }
});

// PUT "/api/shopping/:shoppingId" => updates a shopping item
router.put("/:shoppingId", verifyToken, async (req, res, next) => {
  try {
    const { shoppingId } = req.params;
    const { name, completed } = req.body;

    const shoppingItem = await Shopping.findByIdAndUpdate(
      shoppingId,
      {
        name,
        completed,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!shoppingItem) {
      return res.status(404).json({
        errorMessage: "Shopping item not found.",
      });
    }

    res.status(200).json(shoppingItem);
  } catch (error) {
    next(error);
  }
});

// DELETE "/api/shopping/:shoppingId" => deletes a shopping item
router.delete("/:shoppingId", verifyToken, async (req, res, next) => {
  try {
    const { shoppingId } = req.params;

    const shoppingItem = await Shopping.findByIdAndDelete(shoppingId);

    if (!shoppingItem) {
      return res.status(404).json({
        errorMessage: "Shopping item not found.",
      });
    }

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;