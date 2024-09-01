import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  history: {
    type: Array,
  },
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);
