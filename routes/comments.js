// const express = require("express");
// const router = express.Router();

// const Post = require("../models/post");
// const User = require("../models/user");
// const Comment = require("../models/comments");

// const mongoose = require("mongoose");

// // http://localhost:5000/post/comment/add/:id
// // PUT
// // PRIVATE
// // ADD COMMENT TO POST

// router.put("/comment/add/:id", async (req, res) => {
//     const { post_id, comment } = req.body;

//     const post = await Post.findById(post_id);

//     const newComment = new Comment({
//       user_id: req.params.id,
//       comment: comment,
//     });

//     if (post !== null) {
//       await post.updateOne(
//         {
//           $push: { comments: newComment },
//         },
//         { new: true }
//       );
//       res.status(200).json({ msg: "Comment Added" });
//     } else {
//       res.status(300).json({ msg: "Post Not Available" });
//     }
//   });

//   // http://localhost:5000/post/comment/remove/:id
//   // PUT
//   // PRIVATE
//   // REMOVE COMMENT FROM POST

//   router.put("/comment/remove/:id", async (req, res) => {
//     const { post_id, comment_id } = req.body;

//     Post.findByIdAndUpdate(
//       post_id,
//       {
//         $pull: {
//           comments: {
//             _id: mongoose.Types.ObjectId(comment_id),
//           },
//         },
//       },
//       { new: true }
//     ).then((result) => {
//       res.status(200).json(result);
//     });
//   });

//   // http://localhost:5000/post/comment/replay/add/:id
//   // PUT
//   // PRIVATE
//   // ADD REPLAY TO COMMENT TO POST

//   router.put("/comment/replay/add/:id", (req, res) => {});

//   // http://localhost:5000/post/comment/replay/remove/:id
//   // PUT
//   // PRIVATE
//   // REMOVE REPLAY FROM COMMENT POST

//   router.put("/comment/replay/remove/:id", (req, res) => {});
