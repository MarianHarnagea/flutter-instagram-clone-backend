const mongoose = require("mongoose");
const Comment = require("./comments");

const PostSchema = new mongoose.Schema(
  {
    user_id: String,
    post_image_url: String,
    description: String,
    likes: [],
    comments: [],
  },
  { timestamps: true }
);

const Post = mongoose.model("post", PostSchema);

module.exports = Post;
