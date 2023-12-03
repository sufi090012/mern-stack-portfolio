import mongoose from "mongoose";

const testimonialSchema = mongoose.Schema({
  title: String,
  name: String,
  imageFile: String,
  years: String,
  university: String,
  info: String,
  description: String,
  resume: String,

  name: String,
  creator: {
    type: String,
    index: true,
  },
  imageFile: String,

  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const TestimonialModal = mongoose.model("Testimonial", testimonialSchema);

export default TestimonialModal;
