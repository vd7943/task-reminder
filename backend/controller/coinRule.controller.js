import CoinRule from "../model/coinRule.model.js";
import User from "../model/user.model.js";
import path from "path";
import fs from "fs";

const mappingPath = path.resolve("config/userTypeMappings.json");

let userTypes = [];

try {
  const data = JSON.parse(fs.readFileSync(mappingPath));
  userTypes = data.userTypes || [];
} catch {
  userTypes = [];
}

export const addOrUpdateCoinRule = async (req, res) => {
  const { freeSubsCoins, addPastRemarkCoins, startNewPlanCoins, extraCoins } =
    req.body;

  try {
    let existingRule = await CoinRule.findOne({ freeSubsCoins });

    if (existingRule) {
      const freeSubsCoinsChanged =
        existingRule.freeSubsCoins !== freeSubsCoins &&
        freeSubsCoins !== undefined;

      const pastRemarkCoinsChanged =
        existingRule.addPastRemarkCoins !== addPastRemarkCoins &&
        addPastRemarkCoins !== undefined;

      existingRule.freeSubsCoins = freeSubsCoins;
      existingRule.planRestartCoins = addPastRemarkCoins;
      existingRule.startNewPlanCoins = startNewPlanCoins;
      existingRule.extraCoins = extraCoins;

      await existingRule.save();

      const allUsers = await User.find({
        userType: { $in: [userTypes[1], userTypes[2]] },
      });

      if (freeSubsCoinsChanged) {
        await Promise.all(
          allUsers.map(async (user) => {
            user.notifications.push({
              message: `🔔 New Update: Collect ${freeSubsCoins} coins to earn 1 month of free ${userTypes[1]} subscription!`,
            });
            await user.save();
          })
        );
      }

      return res
        .status(200)
        .json({ success: true, message: "Rule updated successfully" });
    }

    await CoinRule.deleteMany({});
    const newRule = new CoinRule({
      freeSubsCoins,
      addPastRemarkCoins,
      startNewPlanCoins,
      extraCoins,
    });
    await newRule.save();

    const allUsers = await User.find({
      userType: { $in: [userTypes[1], userTypes[2]] },
    });

    await Promise.all(
      allUsers.map(async (user) => {
        user.notifications.push({
          message: `🔔 New Update: Collect ${freeSubsCoins} coins to earn 1 month of free ${userTypes[1]} subscription!`,
        });
        await user.save();
      })
    );

    res.status(201).json({ success: true, message: "Rule added successfully" });
  } catch (error) {
    console.error("Error updating rules:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update rules", error });
  }
};

export const getCoinRules = async (req, res) => {
  try {
    const rules = await CoinRule.find({});
    res.status(200).json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
