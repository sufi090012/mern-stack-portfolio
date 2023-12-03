import ServicesModal from "../models/services.js";
import mongoose from "mongoose";
import cache from "memory-cache";

export const createServices = async (req, res) => {
  const Services = req.body;
  const newServices = new ServicesModal({
    ...Services,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newServices.save();

    // Update the cache with the newly created Services
    const prefix = "Servicess_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.status(201).json(newServices);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const deleteServices = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Services exists with id: ${id}` });
    }

    // Remove the Services from the database
    await ServicesModal.findByIdAndRemove(id);

    // Update the corresponding cache entries for all Services cards
    const prefix = "Servicess_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json({ message: "Services deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const updateServices = async (req, res) => {
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
        .json({ message: `No Services exists with id: ${id}` });
    }

    // Update the Services in the database
    const updatedServices = {
      title,
      description,
      university,
      name,
      info,
      years,
      resume,
      imgurl,

      imageFile,
      creator,
      _id: id,
    };
    await ServicesModal.findByIdAndUpdate(id, updatedServices, { new: true });

    // Update the corresponding cache entries for all Services cards
    const prefix = "Servicess_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json(updatedServices);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getServices = async (req, res) => {
  const { id } = req.params;
  try {
    const Services = await ServicesModal.findById(id);
    res.status(200).json(Services);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const getServicessByUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "User doesn't exist" });
  }
  const cacheKey = `Servicess_user_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const userServicess = await ServicesModal.find({ creator: id });

  // Update cache with the fetched data for the specific user
  cache.put(cacheKey, userServicess);

  res.status(200).json(userServicess);
};

export const getServicess = async (req, res) => {
  const { page } = req.query;
  try {
    const limit = 10;
    const startIndex = (Number(page) - 1) * limit;

    // Check if data is present in cache for the specific page
    const cachedData = cache.get(`Servicess_page_${page}`);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query the database to fetch the Servicess for the specific page and get the total count simultaneously
    const [Servicess, total] = await Promise.all([
      ServicesModal.find().limit(limit).skip(startIndex).lean(),
      ServicesModal.countDocuments({}),
    ]);

    // Preload the data for the next page and store it in cache
    const nextPage = Number(page) + 1;
    const nextStartIndex = startIndex + limit;
    const nextServicess = await ServicesModal.find()
      .limit(limit)
      .skip(nextStartIndex)
      .lean();
    const cachedNextPage = {
      data: nextServicess,
      currentPage: nextPage,
      totalServicess: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Servicess_page_${nextPage}`, cachedNextPage);

    // Update cache with the fetched data for the specific page
    const cachedServicess = {
      data: Servicess,
      currentPage: Number(page),
      totalServicess: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Servicess_page_${page}`, cachedServicess);

    res.json(cachedServicess);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getServicessBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const Servicess = await ServicesModal.find({ title });
    res.json(Servicess);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
