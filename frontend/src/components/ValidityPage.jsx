import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

const ValidityPage = () => {
  const [authUser, setAuthUser] = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/user/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response?.data?.user?.subscriptionEndDate) {
          setSubscription(response?.data?.user?.subscriptionEndDate);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  // Calculate Subscription Days Left
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
    setTimeLeft(`${days} Days`);
  };

  useEffect(() => {
    if (subscription) {
      calculateTimeLeft(subscription);
    }
  }, [subscription]);

  const subscriptionEndDate = subscription ? new Date(subscription) : null;

  if (subscriptionEndDate) {
    subscriptionEndDate.setHours(subscriptionEndDate.getHours() - 5);
    subscriptionEndDate.setMinutes(subscriptionEndDate.getMinutes() - 30);
  }

  // Fetch User Plans
  useEffect(() => {
    axios
      .get(`http://localhost:3000/plan/get-user-plan/${authUser._id}`)
      .then((response) => {
        setPlans(response.data);
      })
      .catch((error) => console.error(error));
  }, [authUser._id]);

  // Calculate Days Left for Any Date
  const calculateDaysLeft = (date) => {
    if (!date) return "N/A";

    const now = new Date();
    const targetDate = new Date(date);
    targetDate.setHours(targetDate.getHours() - 5);
    targetDate.setMinutes(targetDate.getMinutes() - 30);

    const difference = targetDate - now;
    return difference > 0
      ? `${Math.ceil(difference / (1000 * 60 * 60 * 24))} Days`
      : "Started";
  };

  // Get Actual Start Date (First Task Date)
  const getPlanStartDate = (tasks) => {
    if (!tasks || tasks.length === 0) return "N/A";

    const firstTaskDate = tasks
      .map((task) => new Date(task.schedule[0]?.date))
      .filter((date) => !isNaN(date))
      .sort((a, b) => a - b)[0]; // Get the earliest date

    return firstTaskDate ? firstTaskDate.toDateString() : "N/A";
  };

  // Calculate Plan End Date (Based on Last Task Schedule)
  const getPlanEndDate = (tasks) => {
    if (!tasks || tasks.length === 0) return "N/A";

    const lastTaskDate = tasks
      .map((task) => new Date(task.schedule[task.schedule.length - 1]?.date))
      .filter((date) => !isNaN(date))
      .sort((a, b) => b - a)[0]; // Get the latest date

    return lastTaskDate ? lastTaskDate.toDateString() : "N/A";
  };

  return (
    <div className="p-6 w-screen lg:w-[960px] pt-16 lg:pt-6 lg:pl-6 min-h-screen">
      <h2 className="text-3xl mb-4">Validity Page</h2>

      {/* Subscription Section */}
      <div className="mb-8 p-6 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 transition">
        <h3 className="text-2xl font-semibold text-purple-300">
          Subscription Details
        </h3>
        <p className="text-lg mt-2">
          <strong className="text-blue-300">Subscription End Date:</strong>{" "}
          {subscriptionEndDate ? subscriptionEndDate.toDateString() : "N/A"}
        </p>
        <p className="text-lg">
          <strong className="text-blue-300">Subscription Ends in:</strong>{" "}
          {timeLeft}
        </p>
      </div>

      {/* Plans Section */}
      {plans.length > 0 ? (
        plans.map((plan) => (
          <div
            key={plan._id}
            className="mb-8 p-6 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 transition hover:shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-purple-400">
              {plan.planName}
            </h3>
            <p className="text-lg">
              <strong className="text-blue-300">Actual Start Date:</strong>{" "}
              {getPlanStartDate(plan.tasks)}
            </p>
            <p className="text-lg">
              <strong className="text-blue-300">Days Left to Start:</strong>{" "}
              {calculateDaysLeft(getPlanStartDate(plan.tasks))}
            </p>
            <p className="text-lg">
              <strong className="text-blue-300">Plan End Date:</strong>{" "}
              {getPlanEndDate(plan.tasks)}
            </p>
            <p className="text-lg">
              <strong className="text-blue-300">Days Left to End:</strong>{" "}
              {calculateDaysLeft(getPlanEndDate(plan.tasks))}
            </p>
            <p className="text-lg">
              <strong className="text-blue-300">Status:</strong> {plan.status}
            </p>

            {/* Task Details */}
            <h4 className="mt-4 text-xl font-semibold text-green-300">Tasks</h4>
            {plan.tasks.length > 0 ? (
              plan.tasks.map((task) => (
                <div
                  key={task._id}
                  className="mt-3 p-4 bg-black/20 backdrop-blur-lg rounded-md shadow-md transition"
                >
                  <p>
                    <strong className="text-yellow-300">Task Name:</strong>{" "}
                    {task.taskName}
                  </p>
                  <p>
                    <strong className="text-yellow-300">Start Date:</strong>{" "}
                    {task.schedule[0]?.date || "N/A"}
                  </p>
                  <p>
                    <strong className="text-yellow-300">
                      Days Left to Start:
                    </strong>{" "}
                    {calculateDaysLeft(task.schedule[0]?.date)}
                  </p>
                  <p>
                    <strong className="text-yellow-300">End Date:</strong>{" "}
                    {task.schedule.length > 0
                      ? new Date(
                          task.schedule[task.schedule.length - 1]?.date
                        ).toDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong className="text-yellow-300">
                      Days Left to End:
                    </strong>{" "}
                    {calculateDaysLeft(
                      task.schedule[task.schedule.length - 1]?.date
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-lg text-red-400">No tasks found.</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-lg text-red-400">No plans found.</p>
      )}
    </div>
  );
};

export default ValidityPage;
