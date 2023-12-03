import ProjectModal from "../models/project.js";
import mongoose from "mongoose";
import cache from "memory-cache";

export const createProject = async (req, res) => {
  const Project = req.body;
  const newProject = new ProjectModal({
    ...Project,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newProject.save();

    // Update the cache with the newly created project
    const prefix = "projects_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `No Project exists with id: ${id}` });
    }

    // Remove the project from the database
    await ProjectModal.findByIdAndRemove(id);

    // Update the corresponding cache entries for all project cards
    const prefix = "projects_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    toptext1,
    toptext2,
    description,
    creator,
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
        .json({ message: `No Project exists with id: ${id}` });
    }

    // Update the project in the database
    const updatedProject = {
      creator,
      title,
      toptext1,
      toptext2,
      description,
      link,
      imgurl,
      imgurl1,
      imgurl2,
      imageFile,
      imageFile1,
      imageFile2,
      imageFile3,
      _id: id,
    };
    await ProjectModal.findByIdAndUpdate(id, updatedProject, { new: true });

    // Update the corresponding cache entries for all project cards
    const prefix = "projects_";
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await ProjectModal.findById(id);
    res.status(200).json(project);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const getProjectsByUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "User doesn't exist" });
  }
  const cacheKey = `projects_user_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const userProjects = await ProjectModal.find({ creator: id });

  // Update cache with the fetched data for the specific user
  cache.put(cacheKey, userProjects);

  res.status(200).json(userProjects);
};

export const getProjects = async (req, res) => {
  const { page } = req.query;
  try {
    const limit = 10;
    const startIndex = (Number(page) - 1) * limit;

    // Check if data is present in cache for the specific page
    const cachedData = cache.get(`projects_page_${page}`);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query the database to fetch the projects for the specific page and get the total count simultaneously
    const [projects, total] = await Promise.all([
      ProjectModal.find().limit(limit).skip(startIndex).lean(),
      ProjectModal.countDocuments({}),
    ]);

    // Preload the data for the next page and store it in cache
    const nextPage = Number(page) + 1;
    const nextStartIndex = startIndex + limit;
    const nextProjects = await ProjectModal.find()
      .limit(limit)
      .skip(nextStartIndex)
      .lean();
    const cachedNextPage = {
      data: nextProjects,
      currentPage: nextPage,
      totalProjects: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`projects_page_${nextPage}`, cachedNextPage);

    // Update cache with the fetched data for the specific page
    const cachedProjects = {
      data: projects,
      currentPage: Number(page),
      totalProjects: total,
      numberOfPages: Math.ceil(total / limit),
    };
    cache.put(`projects_page_${page}`, cachedProjects);

    res.json(cachedProjects);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
export const getProjectsBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const Projects = await ProjectModal.find({ title });
    res.json(Projects);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};
