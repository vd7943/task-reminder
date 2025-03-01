import React from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";

const SignUp = () => {
  const handleGitHubSignUp = () => {
    window.location.href = "http://localhost:3000/user/auth/github";
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:3000/user/auth/google";
  };
  return (
    <div className="flex w-screen h-screen items-center justify-center py-4">
      <div id="my_modal_3" className="flex justify-end items-center">
        <div className="bg-[#FFFFFF2B] rounded-xl px-10 py-5 flex flex-col">
          <h3 className="font-bold text-center text-4xl pb-20">Sign up</h3>
          <div>
            <form action="" className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="bg-white mb-5 flex items-center justify-center gap-3 text-gray-600 border border-gray-300 py-3 px-8 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 duration-300 cursor-pointer"
              >
                <FaGoogle size={20} className="text-[#EA4335]" />
                <span className="font-medium">Sign up with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGitHubSignUp}
                className="bg-[#151025] flex items-center justify-center gap-3 text-white py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 cursor-pointer"
              >
                <FaGithub size={20} />
                <span> Sign up with GitHub</span>
              </button>
              <p className="mx-auto">
                Have account?{" "}
                <Link
                  to="/login"
                  className="underline text-blue-500 cursor-pointer"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
