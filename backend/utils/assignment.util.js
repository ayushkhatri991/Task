import Task from "../models/task.model.js";
import User from "../models/user.model.js";

/**
 * Find the best user to assign a task to, using:
 * 1. Skill matching (case-insensitive, all required skills must match)
 * 2. Priority-based selection (high/medium: prefer users with no in-progress task)
 * 3. Workload-based greedy selection (least remaining estimated hours)
 *
 * @param {Object} options
 * @param {string[]} options.skills - Required skills for the task
 * @param {string} options.priority - Task priority: "high", "medium", or "low"
 * @param {string[]} options.excludeUserIds - User IDs to exclude from consideration
 * @returns {Promise<Object|null>} The best user object, or null if none found
 */
export async function findBestAssignee({ skills = [], priority = "medium", excludeUserIds = [] }) {
  // Get employees, excluding specified users (both active and non-active)
  const users = await User.find({
    role: "employee",
    _id: { $nin: excludeUserIds }
  });

  if (!users || users.length === 0) {
    return null;
  }

  // Filter by skills (case-insensitive, all skills must match)
  let eligibleUsers = [...users];
  if (skills && skills.length > 0) {
    const matchingUsers = users.filter((u) =>
      skills.every((skill) =>
        (u.skills || []).some(
          (userSkill) => userSkill && userSkill.toLowerCase() === skill.toLowerCase()
        )
      )
    );

    if (matchingUsers.length > 0) {
      eligibleUsers = matchingUsers;
    } else {
      return null; // No users with all required skills
    }
  }

  let selectedUser = null;
  let minWorkload = Infinity;

  // High and medium priority: prefer users with no active in-progress task
  if (priority === "high" || priority === "medium") {
    for (let user of eligibleUsers) {
      const existingTask = await Task.findOne({
        assignedTo: user._id,
        status: "in-progress"
      });

      // Pick immediately if no active task
      if (!existingTask) {
        selectedUser = user;
        break;
      }
    }
  }

  // If no free user OR low priority → use workload-based selection
  if (!selectedUser) {
    const now = new Date();

    for (let user of eligibleUsers) {
      const tasks = await Task.find({
        assignedTo: user._id,
        status: { $in: ["pending", "in-progress"] }
      });

      const workload = tasks.reduce((sum, task) => {
        let remaining = Number(task.estimatedHours) || 0;

        if (task.status === "in-progress" && task.startedAt) {
          const start = new Date(task.startedAt).getTime();
          const nowTime = now.getTime();

          if (!isNaN(start) && nowTime > start) {
            const elapsed = (nowTime - start) / (1000 * 60 * 60);
            remaining = Math.max(remaining - elapsed, 0);
          }
        }

        return sum + remaining;
      }, 0);

      if (workload < minWorkload) {
        minWorkload = workload;
        selectedUser = user;
      }
    }
  }

  return selectedUser;
}
