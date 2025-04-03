import PlanLimit from "../model/planLimit.model.js";

export const getPlanLimit = async (req, res) => {
  try {
    const limitData = await PlanLimit.findOne();
    res.json({ planLimit: limitData ? limitData.limit : 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const setPlanLimit = async (req, res) => {
  try {
    const { planLimit } = req.body;

    let limitData = await PlanLimit.findOne();
    if (limitData) {
      limitData.limit = planLimit;
      await limitData.save();
    } else {
      await PlanLimit.create({ limit: planLimit });
    }

    res.json({ success: true, message: "Plan limit updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
