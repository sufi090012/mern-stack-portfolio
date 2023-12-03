import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import UserModal from "../models/user.js";

const secret = "test";

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });
    if (!oldUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    if (oldUser.newEmail) {
      // If a new email has been changed, use the new email for authentication
      oldUser.email = oldUser.newEmail;
      oldUser.newEmail = undefined;
      await oldUser.save();
    }

    if (oldUser.newPassword) {
      // If a new password has been changed, use the new password for authentication
      oldUser.password = oldUser.newPassword;
      oldUser.newPassword = undefined;
      await oldUser.save();
    }

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "1h",
    });
    oldUser.sessionToken = token;
    await oldUser.save();
    res.status(200).json({ result: oldUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // const existingUser = await UserModal.findOne({}); // Check if any user already exists

    // if (existingUser) {
    //   return res.status(400).json({ message: "User already exists" });
    // }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, {
      expiresIn: "1h",
    });
    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const changeEmail = async (req, res) => {
  const { oldEmail, newEmail } = req.body;

  try {
    const userId = req.userId; // Extract the logged-in user's ID from the request (assumed to be stored in the "userId" field)
    const user = await UserModal.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    if (user.email !== oldEmail) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: "Email change requested successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const userId = req.userId; // Extract the logged-in user's ID from the request (assumed to be stored in the "userId" field)
    const user = await UserModal.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Check if the provided current password matches the stored password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password field in the user object
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};
