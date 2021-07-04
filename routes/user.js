const express = require("express");
const router = express.Router();
const User = require("../models/user");

// http://localhost:5000/user/:id
// GET
// PUBLIC
// GET USER DATA

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);

  User.findById(id)
    .select("-password")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => res.status(400).json({ msg: "Something When Wrong" }));
});

// http://localhost:5000/user/search
// POST
// PUBLIC
// GET USER FRMO SEARCH

router.post("/search", async (req, res) => {
  const { search } = req.body;

  if (search.length <= 3) {
    res.status(200).json({ msg: "More then 3 Letters Are Needed" });
  } else {
    const regex = new RegExp(search, "i");
    User.find({
      $or: [
        { user_name: { $regex: regex } },
        { first_name: { $regex: regex } },
        { last_name: { $regex: regex } },
      ],
    })
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(400).json({ msg: "Something Gone Wrong" }));
  }
});

// http://localhost:5000/user/follow/:id
// PUT
// PRIVATE
// FOLLOW / UNFOLLOW A USER

router.put("/follow/:id", async (req, res) => {
  const userToBeFollowed = req.body.user_id;

  // console.log();

  try {
    const currentUser = await User.findById(req.params.id);
    const follower = await User.findById(userToBeFollowed);

    if (
      userToBeFollowed !== req.params.id &&
      currentUser !== null &&
      follower !== null
    ) {
      if (!currentUser.following.includes(userToBeFollowed)) {
        await currentUser.updateOne({ $push: { following: userToBeFollowed } });
        await follower.updateOne({ $push: { followers: req.params.id } });
        res.status(200).json({ msg: "Followed" });
      } else {
        await currentUser.updateOne({ $pull: { following: userToBeFollowed } });
        await follower.updateOne({ $pull: { followers: req.params.id } });
        res.status(200).json({ msg: "Unfollowed" });
      }
    } else {
      res.status(400).json({ msg: "Wrong User" });
    }
  } catch (error) {
    res.status(400).json({ msg: "Something Went Wrong" });
    console.log(error);
  }
});

module.exports = router;
