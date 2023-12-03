import mongoose from "mongoose";

const servicesSchema = mongoose.Schema({
  title: String,
  description: String,
  university: String,
  years: String,
  info: String,
  resume: String,
  imgurl: String,
  name: String,

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

const ServicesModal = mongoose.model("Services", servicesSchema);

export default ServicesModal;
