import mongoose from "mongoose";

const coinRuleSchema = new mongoose.Schema({
  freeSubsCoins: { type: Number, required: false },
  addPastRemarkCoins: { type: Number, required: true },
  startNewPlanCoins: { type: Number, required: true },
  extraCoins: { type: Number, required: true },
});

const CoinRule = mongoose.model("CoinRule", coinRuleSchema);
export default CoinRule;
