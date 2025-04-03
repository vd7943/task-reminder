import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    enquiry: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://task-reminder-4sqz.onrender.com/api/contact",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data) {
        toast.success("Message Sent Successfully!");
        setFormData({ name: "", phone: "", email: "", enquiry: "" });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact Form Error:", error);
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col h-screen lg:h-full pt-10 lg:pt-2 items-start ml-[2%] xl:ml-[11%] my-8">
      <h2 className="text-2xl lg:text-4xl">Contact us</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-start p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full ">
          <label className="text-xl pt-1">Full Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your fullname"
            className="w-full mt-1 p-2 border rounded-md outline-none"
          />

          <label className="text-xl pt-1">Email Address*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="w-full mt-1 p-2 border rounded-md outline-none"
          />

          <label className="text-xl pt-1"> Phone Number*</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
            className="w-full mt-1 p-2 border rounded-md outline-none"
          />

          <label className="text-xl pt-1">How can we help you?*</label>
          <textarea
            name="enquiry"
            value={formData.enquiry}
            onChange={handleChange}
            rows={6}
            required
            placeholder="How can we help you?"
            className="w-full mt-1 p-2 border rounded-md outline-none"
          />

          <div className="pt-4 flex flex-col gap-4 items-center">
            <button
              className="bg-[#9D60EC] text-[#151025] py-3 text-lg px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
              type="submit"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
