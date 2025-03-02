import CoinRule from "../model/coinRule.model.js";
import User from "../model/user.model.js";

export const addOrUpdateCoinRule = async (req, res) => {
  const { minDuration, coins, freeSubsCoins } = req.body;

  try {
    let existingRule = await CoinRule.findOne({ minDuration });
    if (existingRule) {
      const freeSubsCoinsChanged = existingRule.freeSubsCoins !== freeSubsCoins;

      existingRule.coins = coins;
      existingRule.freeSubsCoins = freeSubsCoins;
      await existingRule.save();

      if (freeSubsCoins) {
        const usersToUpdate = await User.find({
          coins: freeSubsCoins,
          userType: { $in: ["Custom", "Manage"] },
        });

        for (const user of usersToUpdate) {
          user.coins = 0;
          user.userType = "Custom";
          const currentEndDate = user.subscriptionEndDate
            ? new Date(user.subscriptionEndDate)
            : new Date();
          const updatedEndDate = new Date(
            new Date(currentEndDate).setMonth(currentEndDate.getMonth() + 1)
          );
          user.subscriptionEndDate = updatedEndDate;
          user.notifications.push({
            message: `🎉 Congratulations! You've earned 1 month of free subscription for collecting ${freeSubsCoins} coins.`,
          });
          await user.save();
        }
      }

      if (freeSubsCoinsChanged) {
        const allUsers = await User.find({
          userType: { $in: ["Custom", "Manage"] },
        });
        for (const user of allUsers) {
          user.notifications.push({
            message: `🔔 New Update: Collect ${freeSubsCoins} coins to earn 1 month of free subscription!`,
          });
          await user.save();
        }
      }

      return res
        .status(200)
        .json({ success: true, message: "Rule updated successfully" });
    }
    await CoinRule.deleteMany({});
    const newRule = new CoinRule({ minDuration, coins, freeSubsCoins });
    await newRule.save();

    if (freeSubsCoins) {
      const usersToUpdate = await User.find({
        coins: freeSubsCoins,
        userType: { $in: ["Custom", "Manage"] },
      });

      for (const user of usersToUpdate) {
        user.coins = 0;
        user.userType = "Custom";
        const currentEndDate = user.subscriptionEndDate
          ? new Date(user.subscriptionEndDate)
          : new Date();
        const updatedEndDate = new Date(
          new Date(currentEndDate).setMonth(currentEndDate.getMonth() + 1)
        );
        user.subscriptionEndDate = updatedEndDate;
        user.notifications.push({
          message: `🎉 Congratulations! You've earned 1 month of free subscription for collecting ${freeSubsCoins} coins.`,
        });
        await user.save();
      }
    }

    const allUsers = await User.find({
      userType: { $in: ["Custom", "Manage"] },
    });
    for (const user of allUsers) {
      user.notifications.push({
        message: `🔔 New Update: Collect ${freeSubsCoins} coins to earn 1 month of free subscription!`,
      });
      await user.save();
    }

    res.status(201).json({ success: true, message: "Rule added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
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
