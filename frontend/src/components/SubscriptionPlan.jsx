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

  const navigate = useNavigate();
  const userId = authUser._id;
  const userType = authUser.userType;
  const subscriptionEndDate = authUser.subscriptionEndDate
    ? new Date(authUser.subscriptionEndDate)
    : null;

  if (subscriptionEndDate) {
    subscriptionEndDate.setHours(subscriptionEndDate.getHours() - 5);
    subscriptionEndDate.setMinutes(subscriptionEndDate.getMinutes() - 30);
  }

  useEffect(() => {
    const now = new Date();

    if (userType === "Regular") {
      setIsCustomEligible(true);
      setIsManageEligible(true);
    } else if (userType === "Custom") {
      if (now > subscriptionEndDate) {
        setIsCustomEligible(true);
      }
    } else if (userType === "Manage") {
      setIsCustomEligible(true);
    }
  }, [userType, subscriptionEndDate]);

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

  const handlePayment = async (amount) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please try again.");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:3000/plan/buy-subscription",
        {
          amount,
        },
        { withCredentials: true }
      );

      const options = {
        key: "rzp_test_5DI9ZFnMacE9WG",
        amount: data.order.amount,
        currency: "INR",
        name: "Calendar Planner",
        description: "Subscription Plan",
        order_id: data.order.id,
        handler: async function (response) {
          const payload = {
            razorpay_order_id: response.razorpay_order_id || "",
            razorpay_payment_id: response.razorpay_payment_id || "",
            razorpay_signature: response.razorpay_signature || "",
            userId,
            amount,
          };
          try {
            const verifyRes = await axios.post(
              "http://localhost:3000/plan/verify-payment",
              payload
            );
            if (verifyRes.data.success) {
              toast.success("Payment Successful!");

              const updatedUserRes = await axios.get(
                `http://localhost:3000/user/${userId}`,
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
        theme: {
          color: "#212121",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment Error");
      console.error("Payment Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full items-center xl:ml-[170px] my-5 mt-20 xl:mt-5 bg-[#FFFFFF2B] rounded-xl p-4">
      <h2 className="text-4xl">Subscription Plan</h2>
      <p className="text-xl mt-4">
        We offer great <span className="text-[#9D60EC]">price</span> plans for
        the Website
      </p>
      <p className="mt-4 text-gray-400">
        Subscription End Date:{" "}
        {subscriptionEndDate === null
          ? ""
          : new Date(subscriptionEndDate).toDateString()}
      </p>
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
            More power for small teams to create project plans with confidence.
          </p>
          <p className="text-2xl mt-4">
            Rs {isYearly ? "700" : "100"}{" "}
            <span className="text-lg font-normal">
              / {isYearly ? "year" : "month"}
            </span>
          </p>
          <button
            onClick={() => handlePayment(isYearly ? 700 : 100)}
            className="mt-4 bg-[#9D60EC] text-[#151025] px-5 py-2 rounded-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
            disabled={!isManageEligible}
          >
            {isManageEligible ? "Get Started" : "Not Eligible"}
          </button>
        </div>

        <div className="p-6 bg-[#151025] border border-gray-300 rounded-xl shadow-lg w-72 text-center">
          <h3 className="text-xl">Custom</h3>
          <p className="text-gray-400 mt-2">
            For enterprises that need additional security, control, and support.
          </p>
          <p className="text-2xl mt-4">
            Rs {isYearly ? "1400" : "200"}{" "}
            <span className="text-lg font-normal">
              / {isYearly ? "year" : "month"}
            </span>
          </p>
          <button
            onClick={() => handlePayment(isYearly ? 1400 : 200)}
            className="mt-4 border border-gray-700 px-5 py-2 rounded-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#9D60EC] hover:text-[#151025] duration-300 cursor-pointer"
            disabled={!isCustomEligible}
          >
            {isCustomEligible ? "Buy Now" : "Not Eligible"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
