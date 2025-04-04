import Plan from "../model/plan.model.js";
import Remark from "../model/remark.model.js";
import User from "../model/user.model.js";
import EmailTemplate from "../model/emailTemplate.model.js";
import PlanLimit from "../model/planLimit.model.js";

const getScheduleDates = (startDate, days, srNo) => {
  let schedule = [];
  const daysArray = days
    .split(",")
    .map((day) => parseInt(day.trim(), 10))
    .filter((day) => !isNaN(day));

  let baseDate = new Date(startDate);
  baseDate.setHours(0, 0, 0, 0);

  let taskStartDate = new Date(baseDate);
  taskStartDate.setDate(taskStartDate.getDate() + Number(srNo));

  for (const dayOffset of daysArray) {
    const scheduledDate = new Date(taskStartDate);
    scheduledDate.setDate(taskStartDate.getDate() + dayOffset);

    schedule.push({
      date: scheduledDate.toLocaleDateString("en-CA"),

      time: "00:01",
    });
  }

  return schedule;
};

export const addNewPlan = async (req, res) => {
  const { userId, userRole, planName, tasks, milestones } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const existingPlan = await Plan.findOne({ userId, planName });
    if (existingPlan) {
      return res
        .status(400)
        .json({ success: false, message: "Plan already exists" });
    }

    let baseDate = new Date();

    const formattedTasks = tasks.map((task, index) => {
      const schedule = getScheduleDates(baseDate, task.days, task.srNo);
      return {
        ...task,
        srNo: task.srNo,
        schedule,
      };
    });

    const newPlan = new Plan({
      userId,
      userRole,
      planName,
      tasks: formattedTasks,
      milestones,
      status: "Paused",
      optedCount: userRole === "Admin" ? 0 : undefined,
      createdAt: new Date(),
    });

    await newPlan.save();
    res.status(201).json({
      success: true,
      message: "Plan with milestones added successfully.",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error in addNewPlan:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { planId, taskId } = req.params;
  const { taskName, taskDescription, taskLink, srNo, days } = req.body;

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const taskIndex = plan.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );
    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const baseDate = new Date(plan.createdAt);
    baseDate.setHours(0, 0, 0, 0);

    const task = plan.tasks[taskIndex];
    task.taskName = taskName;
    task.taskDescription = taskDescription;
    task.taskLink = taskLink;
    task.srNo = srNo;
    task.days = days;

    task.schedule = getScheduleDates(baseDate, days, srNo);

    await plan.save();
    res.json({
      success: true,
      message: "Task updated successfully",
      updatedTask: task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { userId, planId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = await Plan.findOne({ _id: planId, userId });

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Plan not found or user is unauthorized" });
    }

    if (user.role === "Admin") {
      await EmailTemplate.deleteMany({
        planName: plan.planName,
        createdBy: "Admin",
      });
    } else if (user.role === "User" && user.userType === "Custom") {
      await EmailTemplate.deleteMany({
        planName: plan.planName,
        createdBy: "Custom",
      });
    }

    const userOptedPlans = await Plan.find({ adminPlanId: planId });

    const userIdsToNotify = userOptedPlans.map((optedPlan) => optedPlan.userId);

    await Plan.deleteMany({ adminPlanId: planId });

    await User.updateMany(
      { _id: { $in: userIdsToNotify } },
      {
        $push: {
          notifications: {
            message: `The plan "${plan.planName}" has been removed by the Admin.`,
            date: new Date(),
            read: false,
          },
        },
      }
    );

    await Plan.findByIdAndDelete(planId);

    return res.status(200).json({
      message: "Plan and associated email templates deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getCoinsEarnedForPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const remarks = await Remark.find({ userId });

    const plan = await Plan.findById(id).populate("tasks");

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    let totalCoins = 0;
    plan.tasks.forEach((task) => {
      remarks.forEach((remark) => {
        if (remark.taskName === task.taskName) {
          totalCoins += remark.coinsEarned;
        }
      });
    });

    res.json({ coinsEarned: totalCoins });
  } catch (error) {
    console.error("Error fetching coins:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlanById = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Error fetching plan details:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updatePlanStatus = async (req, res) => {
  const { id, userId } = req.params;
  const { status } = req.body;

  try {
    const plan = await Plan.findOne({ _id: id, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or unauthorized.",
      });
    }

    if (status === "Active") {
      const limitData = await PlanLimit.findOne();
      const maxActivePlans = limitData ? limitData.limit : 1;

      const activePlans = await Plan.find({ userId, status: "Active" });

      if (activePlans.length >= maxActivePlans) {
        return res.status(400).json({
          success: false,
          message: `You can only have ${maxActivePlans} active plan(s) at a time.`,
        });
      }
    }

    plan.status = status;
    await plan.save();

    res.json({
      success: true,
      message: `Plan status updated to ${status}`,
      plan,
    });
  } catch (error) {
    console.error("Error updating plan status:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllPlans = async (req, res) => {
  const { role, userType } = req.params;
  const { userId } = req.query;

  try {
    let plans;
    if (userType === "Custom") {
      plans = await Plan.find({ userId });
    } else {
      plans = await Plan.find({ userRole: role });
    }

    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const optForPlan = async (req, res) => {
  const { userId, planId } = req.body;

  try {
    const existingPlan = await Plan.findById(planId);

    if (!existingPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const alreadyOpted = await Plan.findOne({
      userId,
      planName: existingPlan.planName,
    });
    if (alreadyOpted) {
      return res.status(400).json({
        success: false,
        message: "You have already opted for this plan",
      });
    }

    const baseDate = new Date();

    const recalculatedTasks = existingPlan.tasks.map((task) => ({
      ...task.toObject(),
      schedule: getScheduleDates(baseDate, task.days, task.srNo),
    }));

    const newPlan = new Plan({
      userId,
      userRole: "User",
      planName: existingPlan.planName,
      tasks: recalculatedTasks,
      status: "Paused",
      createdAt: new Date(),
      adminPlanId: planId,
    });

    await newPlan.save();

    await Plan.findByIdAndUpdate(planId, { $inc: { optedCount: 1 } });

    res.status(201).json({
      success: true,
      message: "Plan opted successfully",
      plan: newPlan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const getPlans = async (req, res) => {
  const userId = req.params.id;

  try {
    const plans = await Plan.find({ userId });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const getTodayPlans = async (req, res) => {
  const userId = req.params.id;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const plans = await Plan.find({ userId });
    const user = await User.findById(userId);
    const remarks = await Remark.find({ userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact admin.",
      });
    }

    const todayPlans = plans
      .map((plan) => {
        const todayTasks = plan.tasks.filter((task) => {
          return (
            task.schedule.some((sched) => sched.date === today) &&
            !remarks.some(
              (remark) =>
                remark.taskName === task.taskName && remark.taskDate === today
            )
          );
        });

        return {
          ...plan._doc,
          tasks: todayTasks,
        };
      })
      .filter((plan) => plan.tasks.length > 0);

    res.status(200).json(todayPlans);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
