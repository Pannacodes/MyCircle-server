const { Schema, model } = require("mongoose");

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required."],
      trim: true,
    },

    generalInfo: {
      type: String,
      trim: true,
    },

    owners: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    enabledModules: [
      {
        type: String,
        enum: ["tasks", "activities", "shopping", "expenses"],
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Group = model("Group", groupSchema);

module.exports = Group;
