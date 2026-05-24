import cron from "node-cron";
import Task from "../models/task.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "./email.util.js";
import { findBestAssignee } from "./assignment.util.js";

const PENDING_TIMEOUT_HOURS = 8;
const MAX_REASSIGN_ATTEMPTS = 3;

/**
 * Reassign a single stale pending task to the next best user.
 * Uses the same skill-matching + workload algorithm as createTask.
 */
async function reassignTask(task) {
  const taskTitle = task.title;
  const oldUserId = task.assignedTo;

  // Build the exclusion list: current assignee + all previous assignees
  const excludeUserIds = [
    oldUserId.toString(),
    ...(task.previousAssignees || []).map((id) => id.toString())
  ];

  // Find the next best user using the shared assignment utility
  const newUser = await findBestAssignee({
    skills: task.skills || [],
    priority: task.priority,
    excludeUserIds
  });

  if (!newUser) {
    // No eligible user found — increment reassignCount so we don't retry forever
    task.reassignCount = (task.reassignCount || 0) + 1;
    await task.save();

    if (task.reassignCount >= MAX_REASSIGN_ATTEMPTS) {
      console.warn(
        `[Auto-Reassign] Task "${taskTitle}" (${task._id}) reached max reassignment attempts (${MAX_REASSIGN_ATTEMPTS}). No eligible users found. Task stays with current assignee.`
      );
    } else {
      console.log(
        `[Auto-Reassign] No eligible user found for task "${taskTitle}" (${task._id}). Attempt ${task.reassignCount}/${MAX_REASSIGN_ATTEMPTS}. Will retry next cycle.`
      );
    }
    return;
  }

  // Reassign the task
  task.previousAssignees = [...(task.previousAssignees || []), oldUserId];
  task.assignedTo = newUser._id;
  task.assignedAt = new Date(); // Reset the 8-hour timer
  task.reassignCount = (task.reassignCount || 0) + 1;
  await task.save();

  // Create notification for the new assignee
  const notificationMessage = `Task auto-reassigned to you: "${taskTitle}" (${task.priority} priority)`;
  await Notification.create({
    userId: newUser._id,
    message: notificationMessage,
    taskId: task._id
  });

  // Send email notification (non-blocking)
  sendEmail(
    newUser.email,
    "Task Auto-Reassigned To You",
    `Hi ${newUser.name},\n\nThe task "${taskTitle}" (${task.priority} priority) has been automatically reassigned to you because the previous assignee did not start it within ${PENDING_TIMEOUT_HOURS} hours.\n\nPlease check your dashboard for details.`
  ).catch((err) =>
    console.error(`[Auto-Reassign] Failed to send email to ${newUser.email}:`, err.message)
  );

  console.log(
    `[Auto-Reassign] Task "${taskTitle}" (${task._id}) reassigned from user ${oldUserId} to ${newUser.name} (${newUser._id}). Attempt ${task.reassignCount}/${MAX_REASSIGN_ATTEMPTS}.`
  );
}

/**
 * Check for stale pending tasks and reassign them.
 * Called by the cron scheduler every 30 minutes.
 */
async function checkAndReassignStaleTasks() {
  try {
    const cutoffTime = new Date(Date.now() - PENDING_TIMEOUT_HOURS * 60 * 60 * 1000);

    // Find tasks that are pending, assigned more than 8 hours ago, and haven't exceeded max attempts
    const staleTasks = await Task.find({
      status: "pending",
      assignedTo: { $ne: null },
      assignedAt: { $lte: cutoffTime },
      reassignCount: { $lt: MAX_REASSIGN_ATTEMPTS }
    });

    if (staleTasks.length === 0) {
      return; // Nothing to do — stay silent
    }

    console.log(`[Auto-Reassign] Found ${staleTasks.length} stale pending task(s). Processing...`);

    for (const task of staleTasks) {
      await reassignTask(task);
    }

    console.log(`[Auto-Reassign] Finished processing stale tasks.`);
  } catch (error) {
    console.error("[Auto-Reassign] Error during stale task check:", error.message);
  }
}

/**
 * Start the cron job that checks for stale pending tasks every 30 minutes.
 */
export function startReassignCron() {
  // Run every 30 minutes: "*/30 * * * *"
  cron.schedule("*/30 * * * *", () => {
    console.log(`[Auto-Reassign] Running stale task check at ${new Date().toISOString()}`);
    checkAndReassignStaleTasks();
  });

  console.log("[Auto-Reassign] Cron job started — checking for stale pending tasks every 30 minutes.");
}
