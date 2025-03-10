import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CoinSetting = () => {
  const [rules, setRules] = useState([]);
  const [minDuration, setMinDuration] = useState("");
  const [coins, setCoins] = useState("");
  const [freeSubsCoins, setFreeSubsCoins] = useState(0);
  const [planRestartCoins, setPlanRestartCoins] = useState(0);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get("https://task-reminder-4sqz.onrender.com/coins/coin-rules");
      setRules(res.data.rules);
    } catch (error) {
      toast.error("Failed to fetch rules");
    }
  };

  const handleAddOrUpdate = async () => {
    if (!minDuration || !coins) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("https://task-reminder-4sqz.onrender.com/coins/coin-rules", {
        minDuration: parseInt(minDuration),
        coins: parseInt(coins),
        freeSubsCoins: parseInt(freeSubsCoins),
        planRestartCoins: parseInt(planRestartCoins),
      });
      toast.success(res.data.message);
      fetchRules();
      setMinDuration("");
      setCoins("");
      setFreeSubsCoins("");
      setPlanRestartCoins("");
    } catch (error) {
      toast.error("Failed to update rules");
    }
  };
  return (
    <div className="flex flex-col h-screen items-start pt-10 md:pt-0 mx-auto mt-10 xl:mt-20">
      <h2 className="text-2xl lg:text-3xl">Coin Settings</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <div className="flex flex-col gap-3 w-full ">
          <label className="block font-medium text-lg">Minimum Duration:</label>
          <input
            type="number"
            placeholder="Minimum Duration (minutes)"
            value={minDuration}
            onChange={(e) => setMinDuration(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">Coins Awarded:</label>
          <input
            type="number"
            placeholder="Coins Awarded"
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Free Subscription Coins:
          </label>
          <input
            type="number"
            placeholder="Free Subscription Coins"
            value={freeSubsCoins}
            onChange={(e) => setFreeSubsCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Coins Needed to Restart Plan:
          </label>
          <input
            type="number"
            placeholder="Plan Restart Coins"
            value={planRestartCoins}
            onChange={(e) => setPlanRestartCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <button
            onClick={handleAddOrUpdate}
            className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
          >
            Add/Update Rule
          </button>
        </div>
      </div>
      <div className="mt-6 rounded-md shadow w-full">
        <h4 className="text-xl font-semibold mb-2">Existing Rule</h4>
        <ul className="mt-2">
          {rules.map((rule, index) => (
            <li
              key={index}
              className="border p-4 text-lg rounded-md bg-gray-800 flex items-center justify-between"
            >
              <span>
                {rule.minDuration} minutes = {rule.coins} coins
              </span>
              <span>Free Subscription: {rule.freeSubsCoins} coins</span>
              <span>Restart Plan: {rule.planRestartCoins} coins</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CoinSetting;
