import PortfolioModal from "../models/portfolio.js";
import mongoose from "mongoose";
import cache from "memory-cache";

export const createPortfolio = async (req, res) => {
  const Portfolio = req.body;
  const newPortfolio = new PortfolioModal({
    ...Portfolio,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newPortfolio.save();

    // Update the cache with the newly created Portfolio
    const prefix = "Portfolios_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.status(201).json(newPortfolio);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const deletePortfolio = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Portfolio exists with id: ${id}` });
    }

    // Remove the Portfolio from the database
    await PortfolioModal.findByIdAndRemove(id);

    // Update the corresponding cache entries for all Portfolio cards
    const prefix = "Portfolios_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const updatePortfolio = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    technology,
    homeinfo,
    jobtitle,
    fullname,
    github,
    facebook,
    twitter,
    devto,
    youtube,
    insta,
    aboutinfo,
    aboutimg,
    years,
    university,
    education,
    resume,
    servicesh1,
    services,
    testimonialimg,
    testimonial,
    email,
    phone,
    address,
    basicinfoq,
    basicinfoa,
    description,
    creator,
    fullnameabout,
    age,
    dob,
    religion,
    intrest,
    experience,
    phoneabout,
    emailabout,
    country,
    language,
    hobby,
    imgurl,
    imgurl1,
    imgurl2,
    imageFile,
    imageFile1,
    imageFile2,
    imageFile3,
    link,
  } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Portfolio exists with id: ${id}` });
    }

    // Update the Portfolio in the database
    const updatedPortfolio = {
      creator,
      title,
      technology,
      homeinfo,
      jobtitle,
      github,
      facebook,
      twitter,
      devto,
      youtube,
      insta,
      fullname,
      aboutinfo,
      aboutimg,
      years,
      university,
      education,
      resume,
      servicesh1,
      services,
      testimonialimg,
      testimonial,
      email,
      phone,
      address,
      language,
      hobby,
      basicinfoq,
      basicinfoa,
      description,
      link,
      fullnameabout,
      age,
      dob,
      religion,
      intrest,
      experience,
      phoneabout,
      emailabout,
      country,
      imgurl,
      imgurl1,
      imgurl2,
      imageFile,
      imageFile1,
      imageFile2,
      imageFile3,
      _id: id,
    };
    await PortfolioModal.findByIdAndUpdate(id, updatedPortfolio, { new: true });

    // Update the corresponding cache entries for all Portfolio cards
    const prefix = "Portfolios_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json(updatedPortfolio);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getPortfolio = async (req, res) => {
  const { id } = req.params;
  try {
    const Portfolio = await PortfolioModal.findById(id);
    res.status(200).json(Portfolio);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const getPortfoliosByUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "User doesn't exist" });
  }
  const cacheKey = `Portfolios_user_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const userPortfolios = await PortfolioModal.find({ creator: id });

  // Update cache with the fetched data for the specific user
  cache.put(cacheKey, userPortfolios);

  res.status(200).json(userPortfolios);
};

export const getPortfolios = async (req, res) => {
  const { page } = req.query;
  try {
    const limit = 10;
    const startIndex = (Number(page) - 1) * limit;

    // Check if data is present in cache for the specific page
    const cachedData = cache.get(`Portfolios_page_${page}`);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query the database to fetch the Portfolios for the specific page and get the total count simultaneously
    const [Portfolios, total] = await Promise.all([
      PortfolioModal.find().limit(limit).skip(startIndex).lean(),
      PortfolioModal.countDocuments({}),
    ]);

    // Preload the data for the next page and store it in cache
    const nextPage = Number(page) + 1;
    const nextStartIndex = startIndex + limit;
    const nextPortfolios = await PortfolioModal.find()
      .limit(limit)
      .skip(nextStartIndex)
      .lean();
    const cachedNextPage = {
      data: nextPortfolios,
      currentPage: nextPage,
      totalPortfolios: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Portfolios_page_${nextPage}`, cachedNextPage);

    // Update cache with the fetched data for the specific page
    const cachedPortfolios = {
      data: Portfolios,
      currentPage: Number(page),
      totalPortfolios: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`Portfolios_page_${page}`, cachedPortfolios);

    res.json(cachedPortfolios);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getPortfoliosBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const Portfolios = await PortfolioModal.find({ title });
    res.json(Portfolios);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
