import mongoose from "mongoose";

const coinRuleSchema = new mongoose.Schema({
  minDuration: { type: Number, required: true },
  coins: { type: Number, required: true },
  freeSubsCoins: { type: Number, required: false },
});

const CoinRule = mongoose.model("CoinRule", coinRuleSchema);
export default CoinRule;
