import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../components/Headers/HomeHeader";
import { useToast } from "../../../hooks/UseToast";
import { postRequest } from "../../../services/apis/requests";
import { Lock, Eye, EyeOff, Type, X } from "lucide-react";
import React, { useState } from "react";

// Virtual Keyboard Component (reused from login)
const VirtualKeyboard = ({
  onKeyPress,
  onClose,
  activeInput,
  currentValue,
}) => {
  const layout = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", "Back"],
    ["Clear", "Space", "Enter"],
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 p-2 shadow-lg rounded-t-lg">
      <div className="bg-white dark:bg-gray-700 p-4 mb-4 rounded-lg">
        <div className="flex flex-col justify-center items-center">
          <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">
            Currently editing: <span className="font-bold">{activeInput}</span>
          </div>
          <div className="text-lg font-medium text-gray-800 dark:text-white break-all min-h-[28px]">
            {currentValue || "Enter Text"}
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid gap-1">
        {layout.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`${
                  key === "Space"
                    ? "w-32"
                    : key === "Back" || key === "Clear" || key === "Enter"
                    ? "w-20"
                    : "w-12"
                } h-12 bg-white dark:bg-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium transition-colors`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [isVirtualKeyboard, setIsVirtualKeyboard] = useState(true);
  const toast = useToast();

  const handleKeyPress = (key) => {
    if (!activeInput) return;

    setFormData((prev) => {
      const current = prev[activeInput];
      let newValue = current;

      switch (key) {
        case "Back":
          newValue = current.slice(0, -1);
          break;
        case "Space":
          newValue = current + " ";
          break;
        case "Clear":
          newValue = "";
          break;
        case "Enter":
          setShowKeyboard(false);
          return prev;
        default:
          newValue = current + key;
      }

      return {
        ...prev,
        [activeInput]: newValue,
      };
    });
  };

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputFocus = (inputName) => {
    if (isVirtualKeyboard) {
      setActiveInput(inputName);
      setShowKeyboard(true);
    }
  };

  const toggleKeyboardMode = () => {
    setIsVirtualKeyboard(!isVirtualKeyboard);
    setShowKeyboard(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const navigate = useNavigate()

  const [isLoading,setLoading] = useState(false)
 
  const handleSubmit = async (e) => {
    e.preventDefault();


    // Password validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (formData.newPassword.length<2 ) {
      toast.error("New password must be at least 2 characters long!");
      return;
    }
    setLoading(true)


    try {
      const response = await postRequest("change-password/", {
        old_password: formData.currentPassword,
        new_password: parseInt(formData.newPassword),
      });

      if (response.success) {
        toast.success("Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
    setLoading(false)

        navigate("/settings")
        
      } else {
        toast.error(response.message || "Failed to change password");
    setLoading(false)

      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false)
  };

  return (
     <>
     <HomeHeader />
    <div className="min-h-screen w-full flex items-start justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Change Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your current password and choose a new one
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={toggleKeyboardMode}
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Type size={16} />
            <span className="text-sm">
              {isVirtualKeyboard ? "Switch to Manual" : "Switch to Virtual"}
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(formData).map((field) => (
            <div key={field} className="space-y-2">
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id={field}
                  name={field}
                  type={showPasswords[field] ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter ${field
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase()}`}
                  value={formData[field]}
                  onChange={handleManualInput}
                  onFocus={() => handleInputFocus(field)}
                  readOnly={isVirtualKeyboard}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords[field] ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}

<button
      type="submit"
      onClick={handleSubmit}
      className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
        isLoading
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
      } transition-colors duration-200`}
      disabled={isLoading} // Disable button when loading
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.963 7.963 0 014 12H2c0 3.042 1.135 5.824 3 7.938l1-1.647z"
          ></path>
        </svg>
      ) : (
        "Change Password"
      )}
    </button>
        </form>
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onClose={() => setShowKeyboard(false)}
          activeInput={activeInput}
          currentValue={formData[activeInput]}
        />
      )}
    </div></>
  );
};

export default ChangePassword;
