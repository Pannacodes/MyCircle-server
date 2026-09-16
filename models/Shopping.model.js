const { Schema, model } = require("mongoose");

const shoppingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Shopping = model("Shopping", shoppingSchema);

module.exports = Shopping;