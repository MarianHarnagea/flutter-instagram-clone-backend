const mongoose = require("mongoose");
// const mongoosastic = require("mongoosastic");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    es_indexed: true,
  },
  user_name: {
    type: String,
    required: true,
    es_indexed: true,
  },
  first_name: {
    type: String,
    required: true,
    es_indexed: true,
  },
  last_name: {
    type: String,
    required: true,
    es_indexed: true,
  },
  password: {
    type: String,
    required: true,
  },
  description: String,
  profile_image: String,
  followers: [],
  following: [],
});

var elasticsearch = require("elasticsearch");
var client = elasticsearch.Client({
  host: "localhost:9200",
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
