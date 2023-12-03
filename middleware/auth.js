import jwt from "jsonwebtoken";
import UserModal from "../models/user.js";

const secret = "test";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;
    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, secret);
      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }

    // Check if the user exists and matches the token
    const user = await UserModal.findById(req.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Check if the user's session token matches the token in the authentication header
    if (user.sessionToken !== token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Check if the user's email is updated
    if (
      user.email !== decodedData.email &&
      user.newEmail !== decodedData.email
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if more than one user exists
    // const otherUsers = await UserModal.countDocuments({
    //   _id: { $ne: req.userId },
    // });

    // if (otherUsers > 0) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized - Account already created" });
    // }

    // Update the user's email in the token if it has been changed
    if (user.newEmail && user.newEmail !== user.email) {
      decodedData.email = user.newEmail;
      const updatedToken = jwt.sign(decodedData, secret, { expiresIn: "1h" });
      req.headers.authorization = `Bearer ${updatedToken}`;
    }

    // Check if the user has changed the password
    if (user.newPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        decodedData.password,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Update the password field in the user object
      user.password = user.newPassword;
      user.newPassword = undefined;
      await user.save();
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default auth;
