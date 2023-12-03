import EducationModal from "../models/education.js";
import mongoose from "mongoose";
import cache from "memory-cache";

export const createEducation = async (req, res) => {
  const Education = req.body;
  const newEducation = new EducationModal({
    ...Education,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newEducation.save();

    // Update the cache with the newly created Education
    const prefix = "Educations_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.status(201).json(newEducation);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const deleteEducation = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Education exists with id: ${id}` });
    }

    // Remove the Education from the database
    await EducationModal.findByIdAndRemove(id);

    // Update the corresponding cache entries for all Education cards
    const prefix = "Educations_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const updateEducation = async (req, res) => {
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
  } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Education exists with id: ${id}` });
    }

    // Update the Education in the database
    const updatedEducation = {
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
    await EducationModal.findByIdAndUpdate(id, updatedEducation, { new: true });

    // Update the corresponding cache entries for all Education cards
    const prefix = "Educations_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json(updatedEducation);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getEducation = async (req, res) => {
  const { id } = req.params;
  try {
    const Education = await EducationModal.findById(id);
    res.status(200).json(Education);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const getEducationsByUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "User doesn't exist" });
  }
  const cacheKey = `Educations_user_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const userEducations = await EducationModal.find({ creator: id });

  // Update cache with the fetched data for the specific user
  cache.put(cacheKey, userEducations);

  res.status(200).json(userEducations);
};

export const getEducations = async (req, res) => {
  const { page } = req.query;
  try {
    const limit = 10;
    const startIndex = (Number(page) - 1) * limit;

    // Check if data is present in cache for the specific page
    const cachedData = cache.get(`Educations_page_${page}`);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query the database to fetch the Educations for the specific page and get the total count simultaneously
    const [Educations, total] = await Promise.all([
      EducationModal.find().limit(limit).skip(startIndex).lean(),
      EducationModal.countDocuments({}),
    ]);

    // Preload the data for the next page and store it in cache
    const nextPage = Number(page) + 1;
    const nextStartIndex = startIndex + limit;
    const nextEducations = await EducationModal.find()
      .limit(limit)
      .skip(nextStartIndex)
      .lean();
    const cachedNextPage = {
      data: nextEducations,
      currentPage: nextPage,
      totalEducations: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Educations_page_${nextPage}`, cachedNextPage);

    // Update cache with the fetched data for the specific page
    const cachedEducations = {
      data: Educations,
      currentPage: Number(page),
      totalEducations: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Educations_page_${page}`, cachedEducations);

    res.json(cachedEducations);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getEducationsBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const Educations = await EducationModal.find({ title });
    res.json(Educations);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
