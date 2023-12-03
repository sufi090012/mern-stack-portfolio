import mongoose from "mongoose";

const educationSchema = mongoose.Schema({
  title: String,
  years: String,
  name: String,
  university: String,
  info: String,
  description: String,
  resume: String,
  imgurl: String,

  imageFile: String,
  creator: {
    type: String,
    index: true,
  },

  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const EducationModal = mongoose.model("Education", educationSchema);

export default EducationModal;
