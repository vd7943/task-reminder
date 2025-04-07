import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { PiCoinBold } from "react-icons/pi";

const CoinSetting = () => {
  const [rules, setRules] = useState([]);
  const [minDuration, setMinDuration] = useState("");
  const [coins, setCoins] = useState("");
  const [freeSubsCoins, setFreeSubsCoins] = useState("");
  const [addPastRemarkCoins, setAddPastRemarkCoins] = useState("");
  const [startNewPlanCoins, setStartNewPlanCoins] = useState("");
  const [extraCoins, setExtraCoins] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get("https://task-reminder-4sqz.onrender.com/coins/coin-rules");
      const fetchedRules = res.data.rules;
      setRules(fetchedRules);
      if (fetchedRules.length > 0) {
        const rule = fetchedRules[0];
        setMinDuration(rule.minDuration);
        setCoins(rule.coins);
        setFreeSubsCoins(rule.freeSubsCoins || "");
        setAddPastRemarkCoins(rule.addPastRemarkCoins || "");
        setStartNewPlanCoins(rule.startNewPlanCoins || "");
        setExtraCoins(rule.extraCoins || "");
      }
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
        addPastRemarkCoins: parseInt(addPastRemarkCoins),
        startNewPlanCoins: parseInt(startNewPlanCoins),
        extraCoins: parseInt(extraCoins),
      });
      toast.success(res.data.message);
      fetchRules();
      setMinDuration("");
      setCoins("");
      setFreeSubsCoins("");
      setAddPastRemarkCoins("");
      setStartNewPlanCoins("");
      setExtraCoins("");
    } catch (error) {
      toast.error("Failed to update rules");
    }
  };
  return (
    <div className="flex flex-col h-full lg:items-start pt-10 md:pt-0 pb-10 mx-auto my-auto mt-10">
      <h2 className="text-2xl lg:text-3xl text-center">Coin Settings</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <div className="flex flex-col gap-3 w-full">
          <label className="block font-medium text-lg">
            Minimum Task Duration (in minutes)
          </label>
          <input
            type="number"
            placeholder="Minimum Duration (minutes)"
            value={minDuration}
            onChange={(e) => setMinDuration(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Coins Awarded for minimum duration of task:
          </label>
          <input
            type="number"
            placeholder="Coins Awarded"
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Coins Required for Free Subscription
          </label>
          <input
            type="number"
            placeholder="Free Subscription Coins"
            value={freeSubsCoins}
            onChange={(e) => setFreeSubsCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Coins Required to Add Remark for Past Task
          </label>
          <input
            type="number"
            value={addPastRemarkCoins}
            onChange={(e) => setAddPastRemarkCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Coins Awarded for Starting a New Plan
          </label>
          <input
            type="number"
            value={startNewPlanCoins}
            onChange={(e) => setStartNewPlanCoins(e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
          <label className="block font-medium text-lg">
            Coins Awarded for Adding Day Summary
          </label>
          <input
            type="number"
            value={extraCoins}
            onChange={(e) => setExtraCoins(e.target.value)}
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
        <h4 className="text-2xl font-semibold mb-2 text-center lg:text-left">
          Existing Rule
        </h4>
        <ul className="mt-4 space-y-6">
          {rules.map((rule, index) => (
            <li
              key={index}
              className="border border-gray-700 p-6 rounded-lg bg-gray-800 text-white shadow-md"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 font-medium">
                    Minimum Task Duration:
                  </p>
                  <p className="text-lg">{rule.minDuration} minutes</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">
                    Coins Awarded for minimum duration of task:
                  </p>
                  <div className="flex items-center gap-2">
                    {rule.coins} <PiCoinBold className="text-yellow-300" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">
                    Coins Required for Free Subscription
                  </p>
                  <div className="flex items-center gap-2">
                    {rule.freeSubsCoins}{" "}
                    <PiCoinBold className="text-yellow-300" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">
                    Coins Required to Add Remark for Past Task
                  </p>
                  <div className="flex items-center gap-2">
                    {rule.addPastRemarkCoins}{" "}
                    <PiCoinBold className="text-yellow-300" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">
                    Coins Awarded for Starting a New Plan
                  </p>
                  <div className="flex items-center gap-2">
                    {rule.startNewPlanCoins}{" "}
                    <PiCoinBold className="text-yellow-300" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">
                    Coins Awarded for Adding Day Summary
                  </p>
                  <div className="flex items-center gap-2">
                    {rule.extraCoins} <PiCoinBold className="text-yellow-300" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CoinSetting;
