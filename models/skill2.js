import mongoose from "mongoose";

const skill2Schema = mongoose.Schema({
  title: String,
  description: String,
  name: String,

  percentage: Number,
  creator: String,
  imgurl: String,
  imgurl1: String,
  imgurl2: String,
  imageFile: String,
  imageFile1: String,
  imageFile2: String,
  imageFile3: String,
  creator: {
    type: String,
    index: true, // Add an index on the creator field
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Skill2Modal = mongoose.model("Skill2", skill2Schema);

export default Skill2Modal;
