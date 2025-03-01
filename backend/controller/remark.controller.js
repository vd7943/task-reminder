import User from "../model/user.model.js";
import Remark from "../model/remark.model.js";
import CoinRule from "../model/coinRule.model.js";

const calculateCoins = async (taskDuration) => {
  const rules = await CoinRule.find({});
  rules.sort((a, b) => b.minDuration - a.minDuration);

  for (const rule of rules) {
    if (taskDuration >= rule.minDuration) {
      return Math.floor(taskDuration / rule.minDuration) * rule.coins;
    }
  }
  return 0;
};

export const addRemark = async (req, res) => {
  const { taskName, taskDuration, taskReview, taskSummary, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    const existingRemark = await Remark.findOne({ taskName, userId });
    if (existingRemark) {
      return res.status(400).json({
        success: false,
        message: "Remark already added for this task",
      });
    }
    const rules = await CoinRule.find({});
    const minDuration = rules[0]?.minDuration || 0;

    if (taskDuration < minDuration) {
      return res.status(400).json({
        success: false,
        message: `Please add a minimum duration of ${minDuration} minutes.`,
      });
    }

    const remark = new Remark({
      userId: user._id,
      taskName,
      taskDuration,
      taskReview,
      taskSummary,
    });
    await remark.save();

    const coinsToAdd = await calculateCoins(taskDuration);
    if (coinsToAdd > 0) {
      await User.findByIdAndUpdate(userId, { $inc: { coins: coinsToAdd } });
    }
    res
      .status(201)
      .json({ success: true, message: "Remark added successfully", remark });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getRemark = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const remarks = await Remark.find({ userId });
    res.status(200).json({ success: true, remarks });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
