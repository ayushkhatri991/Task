import Notification from "../models/notification.model.js";

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      read: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong fetching notifications",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong updating notifications",
    });
  }
};
