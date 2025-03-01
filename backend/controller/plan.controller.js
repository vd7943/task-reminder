import Plan from "../model/plan.model.js";
import User from "../model/user.model.js";

export const addNewPlan = async (req, res) => {
  const { userId, userRole, planName, reminders } = req.body;

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

    const newPlan = new Plan({
      userId,
      userRole,
      planName,
      reminders,
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
      reminders: existingPlan.reminders,
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

    const todayPlans = plans.filter((plan) =>
      plan.reminders.some((reminder) =>
        reminder.schedule.some((sched) => sched.date === today)
      )
    );

    res.status(200).json(todayPlans);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const addMilestone = async (req, res) => {
  const { userId, planName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the plan based on planName
    const plan = await Plan.findOne({ planName });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const planId = plan._id.toString(); // Get the actual planId

    // Check if the milestone already exists
    const milestoneExists = user.milestones.some(
      (milestone) => milestone.planId.toString() === planId
    );

    if (milestoneExists) {
      return res.status(400).json({ message: "Milestone already added" });
    }

    user.milestones.push({
      planId,
      planName: plan.planName,
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
  const { userId, planName } = req.params; // Accept planName as a parameter

  try {
    const user = await User.findById(userId).select("milestones");
    if (!user) return res.status(404).json({ message: "User not found" });

    const filteredMilestones = planName
      ? user.milestones.filter((milestone) => milestone.planName === planName)
      : user.milestones;

    res.json({ milestones: filteredMilestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
