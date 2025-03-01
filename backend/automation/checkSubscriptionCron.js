import User from "../model/user.model.js";
import cron from "node-cron";

export const checkSubscriptions = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const expiredUsers = await User.find({
        subscriptionEndDate: { $lte: now },
        userType: { $ne: "Regular" },
      });

      if (expiredUsers.length > 0) {
        await User.updateMany(
          { _id: { $in: expiredUsers.map((user) => user._id) } },
          { $set: { userType: "Regular", subscriptionEndDate: null } }
        );
        console.log(`${expiredUsers.length} users downgraded to Regular.`);
      }
    } catch (error) {
      console.error("Error checking subscriptions:", error);
    }
  });
};
