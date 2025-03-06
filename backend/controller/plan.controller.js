import Plan from "../model/plan.model.js";
import Remark from "../model/remark.model.js";
import User from "../model/user.model.js";

export const addNewPlan = async (req, res) => {
  const { userId, userRole, planName, tasks } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const existingPlan = await Plan.findOne({
      userId,
      planName,
    });

    if (existingPlan) {
      return res
        .status(400)
        .json({ success: false, message: "Plan already exists" });
    }

    const createdAt = new Date();

    const getValidDate = (startDate, dayOffset) => {
      let newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() + 1); // Start from the next day
      let daysAdded = 0;

      while (daysAdded < dayOffset) {
        if (newDate.getDay() !== 0) {
          daysAdded++;
        }
        if (daysAdded < dayOffset) {
          newDate.setDate(newDate.getDate() + 1);
        }
      }

      return newDate.toISOString().slice(0, 10); // Format as YYYY-MM-DD
    };

    const formattedTasks = tasks.map((task) => ({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      taskLink: task.taskLink,
      schedule: task.schedule.map((sched) => ({
        date: getValidDate(createdAt, Number(sched.day)), // Convert `day` to `date`
        time: "00:01",
      })),
    }));

    const newPlan = new Plan({
      userId,
      userRole,
      planName,
      tasks: formattedTasks,
      createdAt,
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
      tasks: existingPlan.tasks,
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
    const plan = await Plan.find({
      userId: userId,
    });
    res.status(200).json(plan);
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
  const { userId, taskName, taskDate } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await Plan.findOne({ "tasks.taskName": taskName });
    if (!plan)
      return res.status(404).json({ message: "Task not found in any plan" });

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
