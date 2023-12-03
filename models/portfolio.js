import mongoose from "mongoose";

const portfolioSchema = mongoose.Schema({
  title: String,
  fullname: String,
  jobtitle: String,

  github: String,
  facebook: String,
  twitter: String,
  devto: String,
  youtube: String,
  insta: String,

  years: String,
  university: String,
  education: String,
  resume: String,
  servicesh1: String,
  services: String,
  testimonialimg: String,
  testimonial: String,
  email: String,
  phone: String,
  address: String,

  basicinfoq: String,
  basicinfoa: String,

  technology: String,
  aboutimg: String,
  homeinfo: String,
  aboutinfo: String,
  fullnameabout: String,
  age: String,
  dob: String,
  religion: String,
  intrest: String,
  experience: String,
  phoneabout: String,
  emailabout: String,
  country: String,
  language: String,
  hobby: String,
  link: String,
  description: String,
  imgurl: String,
  name: String,
  creator: {
    type: String,
    index: true,
  },
  imageFile: String,
  imageFile1: String,
  imageFile2: String,
  imageFile3: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const PortfolioModal = mongoose.model("Portfolio", portfolioSchema);

export default PortfolioModal;
