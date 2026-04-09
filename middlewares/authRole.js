import userModel from "../models/user.model.js";

export const authRole = (role) => {
  return async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role === role) {
        next();
      } else {
        res.status(401).json({ message: "Access Denied for this role" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Something went Wrong!!!" });
    }
  };
};