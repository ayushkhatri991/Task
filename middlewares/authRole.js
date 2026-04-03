import userModel from "../models/user.model.js";

export const authRole = (role) => {

  return async (req, res, next) => {

    try {

      const user = await userModel.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message: "Access denied for this role"
        });
      }

      next();

    } catch (err) {

      return res.status(500).json({
        success: false,
        message: err.message || "Something went wrong"
      });

    }

  };

};