const { Schema, model } = require("mongoose");

const activitySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Activity title is required."],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Food & Dining",
        "Entertainment",
        "Sport",
        "Outdoors",
        "Culture",
        "Travel",
        "Other",
      ],
    },

    date: {
      type: Date,
    },

    location: {
      type: String,
      trim: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Activity = model("Activity", activitySchema);

module.exports = Activity;
