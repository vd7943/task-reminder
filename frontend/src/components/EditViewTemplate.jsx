import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

const EditViewTemplate = () => {
  const [templates, setTemplates] = useState({});
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [updatedSubject, setUpdatedSubject] = useState("");
  const [updatedBody, setUpdatedBody] = useState("");
  const [authUser] = useAuth();
  const [userTypes, setUserTypes] = useState([]);

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/config/get-user-type"
      );
      setUserTypes(response.data.userTypes || []);
    } catch (error) {
      console.error("Failed to fetch user types.");
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const RegularType = userTypes[0];
  const CustomType = userTypes[1];
  const ManageType = userTypes[2];

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/email/templates/${
          authUser.userType === CustomType ? CustomType : "Admin"
        }`
      )
      .then((res) => setTemplates(res.data.templates))
      .catch((err) => console.error(err));
  }, [authUser]);

  const handleEdit = (template) => {
    setEditingTemplate(template._id);
    setUpdatedSubject(template.subject);
    setUpdatedBody(template.body);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3000/email/update-template/${editingTemplate}`,
        {
          subject: updatedSubject,
          body: updatedBody,
        }
      );

      toast.success("Template updated successfully");

      setTemplates((prevTemplates) => {
        const updatedTemplates = { ...prevTemplates };
        Object.keys(updatedTemplates).forEach((planName) => {
          updatedTemplates[planName] = updatedTemplates[planName].map((t) =>
            t._id === editingTemplate
              ? { ...t, subject: updatedSubject, body: updatedBody }
              : t
          );
        });
        return updatedTemplates;
      });

      setEditingTemplate(null);
    } catch (err) {
      toast.error("Failed to update template");
    }
  };

  return (
    <div className="p-6 lg:mx-auto h-full pt-16 md:pt-4 w-full xl:w-[960px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-200 pt-4 md:pt-0">
          Email Templates
        </h2>
      </div>

      {Object.keys(templates).length === 0 ? (
        <div className="bg-[#FFFFFF2B] p-6 rounded-lg shadow-lg border border-white/10">
          <p className="text-center text-gray-300">No templates found.</p>
        </div>
      ) : (
        Object.keys(templates).map((planName) => (
          <div key={planName} className="mb-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-4 drop-shadow-md">
              {planName}
            </h3>

            {templates[planName].map((template) => (
              <div
                key={template._id}
                className="relative bg-[#FFFFFF2B] p-6 rounded-lg shadow-lg border border-white/10 hover:bg-gray-800 transition-all duration-200 mb-2"
              >
                {editingTemplate === template._id ? (
                  <>
                    <input
                      type="text"
                      value={updatedSubject}
                      onChange={(e) => setUpdatedSubject(e.target.value)}
                      className="border p-2 w-full bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <textarea
                      value={updatedBody}
                      onChange={(e) => setUpdatedBody(e.target.value)}
                      className="border p-2 w-full bg-gray-800 text-white rounded-md mt-2 h-24 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    ></textarea>
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition-all duration-300 cursor-pointer mt-4"
                    >
                      ✅ Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-xl font-bold text-white mb-2 drop-shadow-md">
                      {template.subject}
                    </h4>
                    <p className="text-gray-300">{template.body}</p>
                    <button
                      onClick={() => handleEdit(template)}
                      className="bg-[#9D60EC] text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-[#c095f8] duration-300 cursor-pointer mt-4"
                    >
                      ✏️ Edit Template
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default EditViewTemplate;
