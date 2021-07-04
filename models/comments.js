const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user_id: String,
    post_id: String,
    comment: String,
    replies: [
      { user_id: String, post_id: String, replay: String },
      { timestamps: true },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("comment", CommentSchema);

module.exports = Comment;
