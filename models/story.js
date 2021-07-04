const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  user_id: String,
  story_image_url: String,
  description: String,
  likes: [
    {
      user_id: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [],
  date: {
    type: Date,
    default: Date.now,
  },
});

const Story = mongoose.model("story", StorySchema);

module.exports = Story;
