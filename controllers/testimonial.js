import TestimonialModal from "../models/testimonial.js";
import mongoose from "mongoose";
import cache from "memory-cache";

export const createTestimonial = async (req, res) => {
  const Testimonial = req.body;
  const newTestimonial = new TestimonialModal({
    ...Testimonial,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newTestimonial.save();

    // Update the cache with the newly created Testimonial
    const prefix = "Testimonials_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const deleteTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Testimonial exists with id: ${id}` });
    }

    // Remove the Testimonial from the database
    await TestimonialModal.findByIdAndRemove(id);

    // Update the corresponding cache entries for all Testimonial cards
    const prefix = "Testimonials_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    university,
    name,
    info,
    resume,
    imgurl,
    years,
    imageFile,

    creator,
    link,
  } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Testimonial exists with id: ${id}` });
    }

    // Update the Testimonial in the database
    const updatedTestimonial = {
      title,
      description,
      university,
      name,
      info,
      resume,
      imgurl,
      years,
      imageFile,
      creator,
      _id: id,
    };
    await TestimonialModal.findByIdAndUpdate(id, updatedTestimonial, {
      new: true,
    });

    // Update the corresponding cache entries for all Testimonial cards
    const prefix = "Testimonials_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json(updatedTestimonial);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    const Testimonial = await TestimonialModal.findById(id);
    res.status(200).json(Testimonial);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const getTestimonialsByUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "User doesn't exist" });
  }
  const cacheKey = `Testimonials_user_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const userTestimonials = await TestimonialModal.find({ creator: id });

  // Update cache with the fetched data for the specific user
  cache.put(cacheKey, userTestimonials);

  res.status(200).json(userTestimonials);
};

export const getTestimonials = async (req, res) => {
  const { page } = req.query;
  try {
    const limit = 10;
    const startIndex = (Number(page) - 1) * limit;

    // Check if data is present in cache for the specific page
    const cachedData = cache.get(`Testimonials_page_${page}`);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query the database to fetch the Testimonials for the specific page and get the total count simultaneously
    const [Testimonials, total] = await Promise.all([
      TestimonialModal.find().limit(limit).skip(startIndex).lean(),
      TestimonialModal.countDocuments({}),
    ]);

    // Preload the data for the next page and store it in cache
    const nextPage = Number(page) + 1;
    const nextStartIndex = startIndex + limit;
    const nextTestimonials = await TestimonialModal.find()
      .limit(limit)
      .skip(nextStartIndex)
      .lean();
    const cachedNextPage = {
      data: nextTestimonials,
      currentPage: nextPage,
      totalTestimonials: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Testimonials_page_${nextPage}`, cachedNextPage);

    // Update cache with the fetched data for the specific page
    const cachedTestimonials = {
      data: Testimonials,
      currentPage: Number(page),
      totalTestimonials: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Testimonials_page_${page}`, cachedTestimonials);

    res.json(cachedTestimonials);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getTestimonialsBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const Testimonials = await TestimonialModal.find({ title });
    res.json(Testimonials);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
