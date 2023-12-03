import TourModal from "../models/tour.js";
import mongoose from "mongoose";
import cache from "memory-cache"; // Adjust the caching library as needed

export const createTour = async (req, res) => {
  const tour = req.body;
  const newTour = new TourModal({
    ...tour,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newTour.save();

    // Update the cache with the newly created tour
    const prefix = "tours_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.status(201).json(newTour);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getTours = async (req, res) => {
  const { page } = req.query;
  try {
    const limit = 3;
    const startIndex = (Number(page) - 1) * limit;

    // Check if data is present in cache for the specific page
    const cachedData = cache.get(`tours_page_${page}`);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query the database to fetch the Tours for the specific page and get the total count simultaneously
    const [tours, total] = await Promise.all([
      TourModal.find().limit(limit).skip(startIndex).lean(),
      TourModal.countDocuments({}),
    ]);

    // Preload the data for the next page and store it in cache
    const nextPage = Number(page) + 1;
    const nextStartIndex = startIndex + limit;
    const nextTours = await TourModal.find()
      .limit(limit)
      .skip(nextStartIndex)
      .lean();
    const cachedNextPage = {
      data: nextTours,
      currentPage: nextPage,
      totalTours: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`tours_page_${nextPage}`, cachedNextPage);

    // Update cache with the fetched data for the specific page
    const cachedTours = {
      data: tours,
      currentPage: Number(page),
      totalTours: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`tours_page_${page}`, cachedTours);

    res.json(cachedTours);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await TourModal.findById(id);
    res.status(200).json(tour);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getToursByUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "User doesn't exist" });
  }

  const cacheKey = `tours_user_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const userTours = await TourModal.find({ creator: id });

  // Update cache with the fetched data for the specific user
  cache.put(cacheKey, userTours);

  res.status(200).json(userTours);
};
export const deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `No Tour exists with id: ${id}` });
    }

    // Remove the tour from the database
    await TourModal.findByIdAndRemove(id);

    // Update the corresponding cache entries for all tour cards
    const prefix = "tours_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json({ message: "tours deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const updateTour = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    creator,
    imgurl,
    imgurl1,
    imgurl2,
    imageFile,
    imageFile1,
    imageFile2,
    imageFile3,
    tags,
  } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `No tour exist with id: ${id}` });
    }

    const updatedTour = {
      creator,
      title,
      date,
      description,
      imgurl,
      imgurl1,
      imgurl2,
      tags,
      imageFile,
      imageFile1,
      imageFile2,
      imageFile3,
      _id: id,
    };
    await TourModal.findByIdAndUpdate(id, updatedTour, { new: true });
    // Update the corresponding cache entries for all tour cards
    const prefix = "tours_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json(updatedTour);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getToursBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const Tours = await TourModal.find({ title });
    res.json(Tours);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
