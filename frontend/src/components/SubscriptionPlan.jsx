import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const SubscriptionPlan = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [authUser, setAuthUser] = useAuth();
  const [isCustomEligible, setIsCustomEligible] = useState(false);
  const [isManageEligible, setIsManageEligible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showYearlyModal, setShowYearlyModal] = useState(false);
  const [pendingYearlyAmount, setPendingYearlyAmount] = useState(null);

  const navigate = useNavigate();
  const userId = authUser._id;
  const userType = authUser.userType;
  const subscriptionEndDate = authUser.subscriptionEndDate
    ? new Date(authUser.subscriptionEndDate)
    : null;

  useEffect(() => {
    if (userType === "Regular") {
      setIsCustomEligible(true);
      setIsManageEligible(true);
    } else if (userType === "Custom") {
      setIsCustomEligible(true);
    } else if (userType === "Manage") {
      setIsManageEligible(true);
    }
  }, [userType]);

  const calculateTimeLeft = (subscription) => {
    if (!subscription) {
      setTimeLeft("Plz subscribe !");
      return;
    }
    const expiryDate = new Date(subscription);
    expiryDate.setHours(expiryDate.getHours() - 5);
    expiryDate.setMinutes(expiryDate.getMinutes() - 30);

    const now = new Date();
    const timeLeftMs = expiryDate - now;

    if (timeLeftMs <= 0) {
      setTimeLeft("Plz subscribe !");
      return;
    }

    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    setTimeLeft(`${days} Days !`);
  };

  useEffect(() => {
    if (authUser.subscriptionEndDate) {
      calculateTimeLeft(authUser.subscriptionEndDate);
    } else {
      setTimeLeft("Plz subscribe !");
    }
  }, [authUser.subscriptionEndDate]);

  if (subscriptionEndDate) {
    subscriptionEndDate.setHours(subscriptionEndDate.getHours() - 5);
    subscriptionEndDate.setMinutes(subscriptionEndDate.getMinutes() - 30);
  }

  useEffect(() => {
    const loadRazorpay = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded!");
      script.onerror = () => console.error("Failed to load Razorpay script.");
      document.body.appendChild(script);
    };

    if (!window.Razorpay) {
      loadRazorpay();
    }
  }, []);

  const handlePayment = (amount, isYearlyPlan, planType) => {
    const currentType = authUser.userType;
    const isSubscribed =
      subscriptionEndDate && new Date(subscriptionEndDate) > new Date();

    if (isYearlyPlan) {
      if (currentType === "Custom" && planType !== "Custom") {
        return toast.error("You can only upgrade to Custom Yearly Plan.");
      }
      if (currentType === "Manage" && planType !== "Manage") {
        return toast.error("You can only upgrade to Manage Yearly Plan.");
      }

      if (
        (currentType === "Custom" || currentType === "Manage") &&
        isSubscribed
      ) {
        setPendingYearlyAmount(amount);
        setShowYearlyModal(true);
        return;
      }
    }

    if (!isYearlyPlan && planType === currentType && isSubscribed) {
      return toast.error(
        `You already have an active ${planType} Monthly Plan.`
      );
    }

    proceedWithPayment(amount);
  };

  const proceedWithPayment = async (amount) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please try again.");
      return;
    }

    try {
      const { data } = await axios.post(
        "https://task-reminder-4sqz.onrender.com/plan/buy-subscription",
        { userId, amount },
        { withCredentials: true }
      );

      const options = {
        key: "rzp_test_5DI9ZFnMacE9WG",
        amount: data.order.amount,
        currency: "INR",
        name: "Task Reminder",
        description: "Subscription Plan",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const payload = {
              razorpay_order_id: response.razorpay_order_id || "",
              razorpay_payment_id: response.razorpay_payment_id || "",
              razorpay_signature: response.razorpay_signature || "",
              userId,
              amount,
            };
            const verifyRes = await axios.post(
              "https://task-reminder-4sqz.onrender.com/plan/verify-payment",
              payload
            );

            if (verifyRes.data.success) {
              toast.success("Payment Successful!");
              const updatedUserRes = await axios.get(
                `https://task-reminder-4sqz.onrender.com/user/${userId}`,
                { withCredentials: true }
              );
              if (updatedUserRes.data.user) {
                setAuthUser(updatedUserRes.data.user);
                localStorage.setItem(
                  "User",
                  JSON.stringify(updatedUserRes.data.user)
                );
              }
              setTimeout(() => {
                navigate("/");
                window.location.reload();
              }, 1000);
            } else {
              toast.error("Payment Verification Failed!");
            }
          } catch (error) {
            toast.error("Verification Error");
            console.error("Payment Verification Error:", error);
          }
        },
        theme: { color: "#212121" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment Error");
      console.error("Payment Error:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="my-8 lg:my-2 w-full flex flex-col items-center">
        <div className="bg-gradient-to-r from-[#9D60EC] to-[#BE1966] ml-2 lg:ml-[20%] p-6 rounded-lg shadow-lg text-white w-full max-w-xl text-center">
          <h4 className="text-lg font-semibold">📅 Subscription Details</h4>
          <div className="mt-3 flex flex-col gap-2">
            {authUser.userType === "Custom" && (
              <div className="flex justify-between items-center border-b border-white pb-2">
                <span className="text-md font-medium">Plan Type:</span>
                <span className="text-lg font-bold text-blue-300">
                  Custom Plan
                </span>
              </div>
            )}
            {authUser.userType === "Manage" && (
              <div className="flex justify-between items-center border-b border-white pb-2">
                <span className="text-md font-medium">Plan Type:</span>
                <span className="text-lg font-bold text-green-300">
                  Manage Plan
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-white pb-2">
              <span className="text-md font-medium">Subscription Ends In:</span>
              <span
                className={`text-lg font-bold ${
                  timeLeft?.includes("Plz subscribe")
                    ? "text-red-500"
                    : "text-green-400"
                }`}
              >
                {authUser.userType === "Regular" ? "Plz Subscribe!" : timeLeft}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-md font-medium">
                Subscription End Date:
              </span>
              <span className="text-lg font-bold text-yellow-300">
                {subscriptionEndDate
                  ? new Date(subscriptionEndDate).toDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full items-center ml-2 xl:ml-[170px] my-5 mt-20 xl:mt-5 bg-[#FFFFFF2B] rounded-xl p-4">
        <h2 className="text-4xl">Subscription Plan</h2>
        {authUser?.subscriptionEndDate ? (
          <p className="text-xl mt-4 text-center text-[#9D60EC]">
            If you buy the yearly plan now,&nbsp; it will automatically <br />{" "}
            start after your current subscription ends.
          </p>
        ) : (
          <p className="text-xl mt-4">
            We offer great <span className="text-[#9D60EC]">price</span> plans
            for the Website
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 rounded-full px-2 py-1 shadow-md">
          <button
            className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
              !isYearly ? "bg-[#9D60EC] text-white" : "text-gray-200"
            }`}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </button>
          <button
            className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
              isYearly ? "bg-[#9D60EC] text-white" : "text-gray-200"
            }`}
            onClick={() => setIsYearly(true)}
          >
            Yearly
          </button>
        </div>
        <p className="mt-2 text-[#9D60EC] font-semibold">SAVE UP TO 30%</p>
        <div className="mt-6 flex flex-col md:flex-row gap-6">
          <div className="p-6 bg-[#151025] border border-gray-300 rounded-xl shadow-lg w-72 text-center relative">
            <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-[#9D60EC] text-white text-sm px-4 py-1 rounded-full">
              Recommended
            </span>
            <h3 className="text-xl mt-2">Manage Plan</h3>
            <p className="text-gray-400 mt-2">
              More power for small teams to create project plans with
              confidence.
            </p>
            <p className="text-2xl mt-4">
              Rs {isYearly ? "700" : "100"}{" "}
              <span className="text-lg font-normal">
                / {isYearly ? "year" : "month"}
              </span>
            </p>
            <button
              onClick={() =>
                handlePayment(isYearly ? 700 : 100, isYearly, "Manage")
              }
              className="mt-4 bg-[#9D60EC] text-[#151025] px-5 py-2 rounded-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
              disabled={!isManageEligible}
            >
              {isManageEligible ? "Buy Now" : "Not Eligible"}
            </button>
          </div>

          <div className="p-6 bg-[#151025] border border-gray-300 rounded-xl shadow-lg w-72 text-center">
            <h3 className="text-xl">Custom</h3>
            <p className="text-gray-400 mt-2">
              For enterprises that need additional security, control, and
              support.
            </p>
            <p className="text-2xl mt-4">
              Rs {isYearly ? "1400" : "200"}{" "}
              <span className="text-lg font-normal">
                / {isYearly ? "year" : "month"}
              </span>
            </p>
            <button
              onClick={() =>
                handlePayment(isYearly ? 1400 : 200, isYearly, "Custom")
              }
              className="mt-4 border border-gray-700 px-5 py-2 rounded-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#9D60EC] hover:text-[#151025] duration-300 cursor-pointer"
              disabled={!isCustomEligible}
            >
              {isCustomEligible ? "Buy Now" : "Not Eligible"}
            </button>
          </div>
        </div>
        {showYearlyModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
            <div className="bg-[#1E1E2F] p-6 rounded-2xl shadow-lg w-[400px] relative border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">
                Confirm Yearly Subscription
              </h2>
              <p className="mb-6">
                You currently have an active subscription. If you buy the yearly
                plan now, it will automatically start after your current
                subscription ends.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowYearlyModal(false)}
                  className="px-4 py-2 bg-red-500 cursor-pointer rounded hover:bg-red-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowYearlyModal(false);
                    proceedWithPayment(pendingYearlyAmount);
                  }}
                  className="px-4 py-2 cursor-pointer bg-green-500 text-white rounded hover:bg-green-400"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlan;
