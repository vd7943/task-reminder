import Plan from "../model/plan.model.js";
import Remark from "../model/remark.model.js";
import User from "../model/user.model.js";
import CoinRule from "../model/coinRule.model.js";

const skipSunday = (date) => {
  while (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

const getTaskStartDate = (baseDate, srNo) => {
  let startDate = new Date(baseDate);
  let daysAdded = 0;

  while (daysAdded < srNo - 1) {
    startDate.setDate(startDate.getDate() + 1);
    if (startDate.getDay() !== 0) {
      daysAdded++;
    }
  }

  return skipSunday(startDate);
};

const getScheduleDates = (taskStartDate, days) => {
  let scheduleDates = [];
  days.sort((a, b) => a - b);

  days.forEach((dayOffset) => {
    let scheduledDate = new Date(taskStartDate);
    let daysAdded = 0;

    while (daysAdded < dayOffset - 1) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      if (scheduledDate.getDay() !== 0) {
        daysAdded++;
      }
    }

    scheduleDates.push({
      date: scheduledDate.toISOString().slice(0, 10),
      time: "00:01",
    });
  });

  return scheduleDates;
};

export const addNewPlan = async (req, res) => {
  const { userId, userRole, planName, planStart, tasks } = req.body;

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

    const srNos = tasks.map((task) => task.srNo);
    if (srNos.length !== new Set(srNos).size) {
      return res.status(400).json({
        success: false,
        message: "Each task must have a unique Sr No. within the plan.",
      });
    }

    let currentDate = new Date();
    if (planStart === "tomorrow") {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const formattedTasks = tasks.map((task) => {
      const taskStartDate = getTaskStartDate(currentDate, task.srNo);
      const schedule = getScheduleDates(
        taskStartDate,
        task.days.split(",").map((day) => Number(day.trim()))
      );

      return {
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        taskLink: task.taskLink,
        srNo: task.srNo,
        days: task.days,
        schedule,
      };
    });

    const newPlan = new Plan({
      userId,
      userRole,
      planName,
      planStart,
      tasks: formattedTasks,
      status: "Paused",
      createdAt: new Date(),
    });

    await newPlan.save();
    res.status(201).json({
      success: true,
      message: "Plan added successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error in addNewPlan:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updatePlanStart = async (req, res) => {
  const { id } = req.params;
  const { planStart } = req.body;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    let currentDate = new Date();
    if (planStart === "tomorrow") {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const updatedTasks = plan.tasks.map((task) => {
      const taskStartDate = getTaskStartDate(currentDate, task.srNo);
      const updatedSchedule = getScheduleDates(
        taskStartDate,
        task.schedule.map((sched) => Number(sched.day))
      );

      return {
        ...task.toObject(),
        schedule: updatedSchedule,
      };
    });

    plan.planStart = planStart;
    plan.tasks = updatedTasks;

    await plan.save();

    res.json({
      success: true,
      message: "Plan start date and task schedules updated",
      plan,
    });
  } catch (error) {
    console.error("Error updating plan start:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
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

    const task = plan.tasks[taskIndex];

    task.taskName = taskName;
    task.taskDescription = taskDescription;
    task.taskLink = taskLink;
    task.srNo = srNo;
    task.days = days;

    let planStartDate = new Date();
    if (plan.planStart === "tomorrow") {
      planStartDate.setDate(planStartDate.getDate() + 1);
    }

    const daysArray = days
      .split(",")
      .map(Number)
      .sort((a, b) => a - b);

    const taskStartDate = getTaskStartDate(planStartDate, srNo);

    task.schedule = getScheduleDates(taskStartDate, daysArray);

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
        message:
          "Plan not found or user is not authorized to update the status.",
      });
    }

    if (status === "Active") {
      await Plan.updateMany(
        { userId, _id: { $ne: id }, status: "Active" }, // Exclude current plan
        { $set: { status: "Paused" } }
      );
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

    const newPlan = new Plan({
      userId,
      userRole: "User",
      planName: existingPlan.planName,
      planStart: existingPlan.planStart,
      tasks: existingPlan.tasks,
      status: "Paused",
      createdAt: new Date(),
    });

    await newPlan.save();

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

export const addMilestone = async (req, res) => {
  const { userId, taskName, taskDate, id } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact admin.",
      });
    }

    const plan = await Plan.findOne({
      "tasks.taskName": taskName,
      status: "Active",
      userId: userId,
      _id: id,
    });
    if (!plan)
      return res.status(404).json({
        message:
          "Plan is not active or user is not authorized to add milestone in this",
      });

    const task = plan.tasks.find((task) => task.taskName === taskName);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const taskScheduled = task.schedule.some(
      (schedule) => schedule.date === taskDate
    );
    if (!taskScheduled) {
      return res
        .status(400)
        .json({ message: "Task is not scheduled on this date" });
    }

    const milestoneExists = user.milestones.some(
      (milestone) =>
        milestone.taskName === taskName && milestone.taskDate === taskDate
    );

    if (milestoneExists) {
      return res.status(400).json({
        success: false,
        message: "Milestone is already added for this task on the given date",
      });
    }

    user.milestones.push({
      taskName,
      taskDate,
      createdAt: new Date(),
    });

    await user.save();
    res.json({
      message: "Milestone added successfully",
      milestones: user.milestones,
    });
  } catch (error) {
    console.error("Error adding milestone:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getMilestones = async (req, res) => {
  const { userId, taskName, taskDate } = req.params;

  try {
    const user = await User.findById(userId).select("milestones");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact admin.",
      });
    }

    let filteredMilestones = user.milestones;

    if (taskName) {
      filteredMilestones = filteredMilestones.filter(
        (milestone) => milestone.taskName === taskName
      );
    }

    if (taskDate) {
      filteredMilestones = filteredMilestones.filter(
        (milestone) => milestone.taskDate === taskDate
      );
    }

    res.json({ milestones: filteredMilestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// restart plan

export const restartPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    const user = await User.findById(userId);
    const plan = await Plan.findById(planId);

    if (!user || !plan || plan.status !== "Paused") {
      return res.status(400).json({
        success: false,
        message: "Invalid request or plan is not paused.",
      });
    }

    const coinRule = await CoinRule.findOne();
    const planRestartCoins = coinRule?.planRestartCoins;

    if (user.coins < planRestartCoins) {
      return {
        success: false,
        message: "Not enough coins to restart the plan.",
      };
    }

    user.coins -= planRestartCoins;
    plan.status = "Active";
    await user.save();

    let lastCompletedTaskNo = 0;

    for (let task of plan.tasks) {
      const remark = await Remark.findOne({ userId, taskName: task.taskName });
      if (remark) {
        lastCompletedTaskNo = Math.max(lastCompletedTaskNo, task.srNo);
      }
    }

    // Reassign tasks from the last completed task onwards
    const remainingTasks = plan.tasks.filter(
      (task) => task.srNo > lastCompletedTaskNo
    );
    const today = new Date();

    remainingTasks.forEach((task, index) => {
      task.scheduledDate = new Date(today.setDate(today.getDate() + index)); // Assign tasks in sequence
    });

    await plan.save();

    return {
      success: true,
      message: "Plan restarted successfully and tasks reassigned.",
    };
  } catch (error) {
    console.error("Error in restartPlan:", error);
    return { success: false, message: "Failed to restart plan." };
  }
};
