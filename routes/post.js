const express = require("express");
const router = express.Router();
const { Storage } = require("@google-cloud/storage");
require("dotenv").config;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comments");

const mongoose = require("mongoose");

// Image Destination and Name
const Mstorage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    // console.log(file.originalname);
    cb(null, req.params.id + "-" + Date.now() + "-" + file.originalname);
  },
});

// Check File Type
// function checkFileType(file, cb) {
//   // Allowed ext
//   const filetypes = /jpeg|jpg|png|gif|webp/;
//   // Check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   return cb(null, true);
// } else {
//     cb("Error: Images Only!");
//     if (mimetype && extname) {
//   }
// }

// Init Image Upload

const upload = multer({
  storage: Mstorage,
  // fileFilter: function (req, file, cb) {
  //   checkFileType(file, cb);
  // },
}).single("image");

// http://localhost:5000/post/friends/:id
// POST
// NON-PRIVATE
// GET ALL FRIENDS POSTS

router.get("/friends/:id", async (req, res) => {
  // console.log(req.params.id);
  try {
    const currentUser = await User.findById(req.params.id);

    const friendsIds = currentUser.following;
    friendsIds.push(currentUser._id);

    let posts = await Post.find({
      user_id: { $in: friendsIds },
    })
      // .limit(10)
      .sort("-createdAt");

    const newPosts = await Promise.all(
      posts.map(async (post) => {
        // console.log(post);
        const user = await User.findById(post.user_id).select("-password");

        const newPost = {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          profile_image: user.profile_image,
          likes: post.likes,
          comments: post.comments,
          _id: post._id,
          user_id: post.user_id,
          post_image_url: post.post_image_url,
          description: post.description,
          createdAt: post.createdAt,
        };
        return newPost;
      })
    );

    // console.log(newPosts);

    res.status(200).json(newPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

// http://localhost:5000/post/own/:id
// POST
// NON-PRIVATE
// GET ALL MY POSTS

router.post("/own/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const posts = await Post.find({ user_id: req.params.id })
      // .limit(10)
      .sort("-createdAt");

    // console.log(posts);

    const newPosts = posts.map((post) => {
      return {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name,
        profile_image: user.profile_image,
        likes: post.likes,
        comments: post.comments,
        _id: post._id,
        user_id: post.user_id,
        post_image_url: post.post_image_url,
        description: post.description,
        createdAt: post.createdAt,
      };
    });

    res.status(200).json(newPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

// http://localhost:5000/posts/all
// POST
// NON-PRIVATE
// GET ALL POSTS

router.post("/all/", async (req, res) => {
  try {
    let posts = await Post.find()
      // .limit(2)
      .sort("-createdAt");

    const newPosts = await Promise.all(
      posts.map(async (post) => {
        // console.log(post);
        const user = await User.findById(post.user_id).select("-password");

        const newPost = {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          profile_image: user.profile_image,
          likes: post.likes,
          comments: post.comments,
          _id: post._id,
          user_id: post.user_id,
          post_image_url: post.post_image_url,
          description: post.description,
          createdAt: post.createdAt,
        };
        return newPost;
      })
    );

    // // console.log(newPosts);

    res.status(200).json(newPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

// http://localhost:5000/posts/user/all/:id
// POST
// NON-PRIVATE
// GET ALL POSTS FROM A USER

router.post("/user/all/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const newUser = {
      _id: user._id,
      email: user.email,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_image: user.profile_image,
      description: user.description,
      followers: user.followers,
      following: user.following,
    };

    const posts = await Post.find({ user_id: req.params.id })
      // .limit(5)
      .sort("-createdAt");

    const newPosts = await Promise.all(
      posts.map(async (post) => {
        const newPost = {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          profile_image: user.profile_image,
          likes: post.likes,
          comments: post.comments,
          _id: post._id,
          user_id: post.user_id,
          post_image_url: post.post_image_url,
          description: post.description,
          createdAt: post.createdAt,
        };
        return newPost;
      })
    );

    const data = {
      user: newUser,
      posts: newPosts,
    };

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

// http://localhost:5000/post/:id
// POST
// NON-PRIVATE
// GET SINGLE POST

router.post("/:id", async (req, res) => {
  const postId = req.body.id;
  const post = await Post.findOne(postId);
  res.status(200).json(post);
});

// http://localhost:5000/post/add/:id
// PUT
// PRIVATE
// ADD NEW POST

router.post("/add/:id", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log("error");
      res.json({
        msg: err,
      });
    } else {
      console.log("undefined");
      if (req.file == undefined) {
        res.json({
          msg: "Error: No File Selected!",
        });
      } else {
        console.log("Image Receved");

        const storage = new Storage({
          projectId: "fleet-parity-316417",
          keyFilename: path.join(
            __dirname,
            "../fleet-parity-316417-d8777bff9421.json"
          ),
        });
        const bucketName = "instagram-clone";
        const imagePath = path.join(__dirname, "../", req.file.path);
        const destination = `${req.params.id}/${req.file.filename}`;

        // Add image to google cloud storage
        storage
          .bucket(bucketName)
          .upload(imagePath, {
            destination: destination,
          })
          .then((result) => {
            console.log("Image Uploaded");

            let url = "https://storage.googleapis.com/instagram-clone/";
            const imageCloudPath = `${destination}`;

            // Delete local image after uploded to google cloud
            fs.unlink(imagePath, (err) => {
              if (err) throw err;
              console.log("Local Image Deleted");
            });

            const newPost = new Post({
              user_id: req.params.id,
              post_image_url: imageCloudPath,
              description: req.body.description,
            });

            newPost
              .save()
              .then((post) => {
                res.json(post);
              })
              .then((result) => {
                console.log(result);
                res.json(result);
              })
              .catch((err) => {
                console.log(err);
                res.json(err);
              });
          })
          .catch((error) => console.log(error));
      }
    }
  });
});

// http://localhost:5000/post/remove/:id
// PUT
// PRIVATE
// REMOVE POST

router.post("/remove/:id", async (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then((post) => {
      console.log(post.post_image_url);

      const storage = new Storage({
        projectId: "fleet-parity-316417",
        keyFilename: path.join(
          __dirname,
          "../fleet-parity-316417-d8777bff9421.json"
        ),
      });

      const bucketname = "instagram-clone";

      ("https://storage.googleapis.com/instagram-clone/");

      // Delete Image from google cloud
      storage
        .bucket(bucketname)
        .file(post.post_image_url)
        .delete()
        .then(() => console.log("cloud image deleted"))
        .catch((err) => res.status(404).json({ msg: "No image Found" }));

      res.sendStatus(200).json("Post Deleted");
    })
    .catch((err) => res.status(500).json({ msg: "Something Went Wrong" }));
});

// http://localhost:5000/post/like/:id
// PUT
// PRIVATE
// ADD OR REMOVE LIKE TO/FROM POST

router.put("/like/:id", async (req, res) => {
  let { post_id } = req.body;

  const post = await Post.findById(post_id);

  if (post !== null) {
    if (!post.likes.includes(req.params.id)) {
      await post.updateOne({
        $push: { likes: req.params.id },
      });
      res.status(200).json({ msg: "Liked" });
    } else {
      await post.updateOne({
        $pull: { likes: req.params.id },
      });
      res.status(200).json({ msg: "Disliked" });
    }
  } else {
    res.status(301).json({ msg: "Post No Longer Available" });
  }
  //
});

// http://localhost:5000/commentss
// POST
// PRIVATE
// GET ALL COMMENT FROM A POST

router.post("/comments/:id", async (req, res) => {
  console.log("Get Comments");
  Comment.find({ post_id: req.params.id })
    // .limit(3)
    .sort("-createdAt")
    .then(async (result) => {
      const newComments = await Promise.all(
        result.map(async (comment) => {
          const user = await User.findById(comment.user_id).select("-password");

          const newComment = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            profile_image: user.profile_image,
            _id: comment._id,
            user_id: comment.user_id,
            post_id: comment.post_id,
            comment: comment.comment,
            replies: comment.replies,
            createdAt: comment.createdAt,
          };
          return newComment;
        })
      );
      console.log(newComments);
      res.status(200).json(newComments);
    })
    .catch((err) => console.log(err));
});

// http://localhost:5000/post/comment/add/:id
// POST
// PRIVATE
// ADD COMMENT TO POST

router.post("/comment/add/:id", async (req, res) => {
  const { post_id, comment } = req.body;

  if (comment == null || comment == "")
    return res.status(400).json({ msg: "Write a comment first" });

  const post = await Post.findById(post_id);
  console.log(post);

  await post.updateOne({
    $push: { comments: req.params.id },
  });

  const newComment = new Comment({
    user_id: req.params.id,
    post_id: post_id,
    comment: comment,
  });

  newComment
    .save()
    .then(async (result) => {
      const user = await User.findById(req.params.id).select("-password");

      const newComment = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name,
        profile_image: user.profile_image,
        _id: result._id,
        user_id: result.user_id,
        post_id: result.post_id,
        comment: result.comment,
        replies: result.replies,
        createdAt: result.createdAt,
      };

      res.status(200).json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Something went wrong" });
    });
});

// http://localhost:5000/post/comment/remove/:id
// PUT
// PRIVATE
// REMOVE COMMENT FROM POST

router.delete("/comment/remove/:id", async (req, res) => {
  const { comment_id } = req.body;
  Comment.findByIdAndDelete(comment_id)
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
});

// http://localhost:5000/post/comment/replay/add/:id
// PUT
// PRIVATE
// ADD REPLAY TO COMMENT TO POST

router.put("/comment/replay/add/:id", (req, res) => {});

// http://localhost:5000/post/comment/replay/remove/:id
// PUT
// PRIVATE
// REMOVE REPLAY FROM COMMENT POST

router.put("/comment/replay/remove/:id", (req, res) => {});

// // http://localhost:5000/post/comment/add/:id
// // PUT
// // PRIVATE
// // ADD COMMENT TO POST

// router.put("/comment/add/:id", async (req, res) => {
//   const { post_id, comment } = req.body;

//   const post = await Post.findById(post_id);

//   const newComment = new Comment({
//     user_id: req.params.id,
//     comment: comment,
//   });

//   if (post !== null) {
//     await post.updateOne(
//       {
//         $push: { comments: newComment },
//       },
//       { new: true }
//     );
//     res.status(200).json({ msg: "Comment Added" });
//   } else {
//     res.status(300).json({ msg: "Post Not Available" });
//   }
// });

// // http://localhost:5000/post/comment/remove/:id
// // PUT
// // PRIVATE
// // REMOVE COMMENT FROM POST

// router.put("/comment/remove/:id", async (req, res) => {
//   const { post_id, comment_id } = req.body;

//   Post.findByIdAndUpdate(
//     post_id,
//     {
//       $pull: {
//         comments: {
//           _id: mongoose.Types.ObjectId(comment_id),
//         },
//       },
//     },
//     { new: true }
//   ).then((result) => {
//     res.status(200).json(result);
//   });
// });

// // http://localhost:5000/post/comment/replay/add/:id
// // PUT
// // PRIVATE
// // ADD REPLAY TO COMMENT TO POST

// router.put("/comment/replay/add/:id", (req, res) => {});

// // http://localhost:5000/post/comment/replay/remove/:id
// // PUT
// // PRIVATE
// // REMOVE REPLAY FROM COMMENT POST

// router.put("/comment/replay/remove/:id", (req, res) => {});

module.exports = router;
