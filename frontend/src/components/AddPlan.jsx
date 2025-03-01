import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const AddPlan = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "reminders",
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  const onSubmit = async (data) => {
    const formattedReminders = data.reminders.map((reminder) => ({
      schedule: reminder.schedule.map((sched) => ({
        date: sched.date,
        time: sched.time,
      })),
    }));

    try {
      const response = await axios.post(
        "https://task-reminder-4sqz.onrender.com/plan/add-plan",
        {
          userId: authUser._id,
          userRole: authUser.role,
          planName: data.planName,
          reminders: formattedReminders,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/pre-built-plans");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDateChange = (date) => {
    setSelectedDates((prevDates) => {
      const exists = prevDates.some((d) => d.getTime() === date.getTime());
      return exists
        ? prevDates.filter((d) => d.getTime() !== date.getTime())
        : [...prevDates, date];
    });
  };

  const addReminderWithDates = () => {
    if (selectedDates.length > 0 && selectedTime) {
      const formattedSchedule = selectedDates.map((date) => {
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        return {
          date: localDate.toISOString().split("T")[0], // Adjust for timezone
          time: selectedTime,
        };
      });

      append({ schedule: formattedSchedule });

      setSelectedDates([]);
      setSelectedTime("");
    } else {
      toast.error("Please select at least one date and a time.");
    }
  };

  return (
    <div className="flex flex-col h-full items-start pt-10 ml-[1%] md:pt-0 lg:ml-[9%] my-8">
      <h2 className="text-2xl lg:text-3xl">Add Plan</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        {authUser.userType === "Custom" && (
          <form
            action=""
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 w-full "
          >
            <label className="block font-medium text-lg">Plan Name:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md outline-none"
              placeholder="Enter task name"
              {...register("planName", { required: true })}
            />

            <h3 className="text-lg font-medium mb-2">Select Dates:</h3>

            <div className="flex items-center justify-center rounded-md overflow-hidden shadow-sm">
              <DatePicker
                selected={null}
                onSelect={handleDateChange}
                inline
                highlightDates={selectedDates}
                minDate={new Date()}
                className="w-full"
              />
            </div>

            {selectedDates.length > 0 && (
              <div className="mt-4 p-3 rounded-md shadow">
                <h4 className="text-lg font-semibold mb-2">Selected Dates:</h4>
                <ul className="space-y-1">
                  {selectedDates.map((date, index) => (
                    <li key={index} className="text-sm bg-gray-800 p-2 rounded">
                      📅 {date.toDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="text-lg font-semibold mt-4">Select Time:</h3>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="p-2 border rounded-md"
            />

            <button
              type="button"
              onClick={addReminderWithDates}
              className="cursor-pointer mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Add Reminder
            </button>

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
            >
              Save Plan
            </button>
          </form>
        )}

        {authUser.role === "Admin" && (
          <form
            action=""
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 w-full "
          >
            <label className="block font-medium text-lg">Plan Name:</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md outline-none"
              placeholder="Enter task name"
              {...register("planName", { required: true })}
            />

            <h3 className="text-lg font-semibold mb-2">Select Dates:</h3>

            <div className="flex items-center justify-center rounded-md overflow-hidden shadow-sm">
              <DatePicker
                selected={null}
                onSelect={handleDateChange}
                inline
                highlightDates={selectedDates}
                className="w-full"
              />
            </div>

            {selectedDates.length > 0 && (
              <div className="mt-4 p-3 rounded-md shadow">
                <h4 className="text-lg font-semibold mb-2">Selected Dates:</h4>
                <ul className="space-y-1">
                  {selectedDates.map((date, index) => (
                    <li key={index} className="text-sm bg-gray-800 p-2 rounded">
                      📅 {date.toDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="text-lg font-semibold mt-4">Select Time:</h3>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="p-2 border rounded-md"
            />

            <button
              type="button"
              onClick={addReminderWithDates}
              className="cursor-pointer mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Add Reminder
            </button>

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
            >
              Save Plan
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPlan;
