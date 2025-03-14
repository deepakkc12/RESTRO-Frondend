import Xeno from "../../assets/images/xenologo.jpg";
import { useToast } from "../../hooks/UseToast";
import { loginSuccess } from "../../redux/Authentication/action";
import { clearCart } from "../../redux/cart/actions";
import { roles } from "../../routes/RolebasedRoutes";
import {
  getRequest,
  patchRequest,
  postRequest,
} from "../../services/apis/requests";
import { Lock, User, CheckCircle2, X, Type } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Virtual Keyboard Component with Preview
const VirtualKeyboard = ({
  onKeyPress,
  onClose,
  activeInput,
  currentValue,
  isNumeric = false,
}) => {
  // Keyboard layout configuration
  const layout = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", "Back"],
    ["Clear", "Enter"],
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 dark:bg-gray-800 p-2 shadow-lg rounded-t-lg max-w-2xl mx-auto">
      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-700 p-3 mb-2 rounded-lg">
        <div className="flex flex-col justify-center items-center">
          <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
            Enter <span className="font-bold text-lg">{activeInput}</span>
          </div>
          <div className="text-lg font-medium text-gray-800 dark:text-white break-all min-h-[28px] max-w-full overflow-x-auto">
            {activeInput === "password"
              ? currentValue
                  .split("")
                  .map(() => "*")
                  .join("")
              : currentValue || "|"}
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* Keyboard Layout */}
      <div className="grid gap-1">
        {layout.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`${
                  key === "Enter"
                    ? "flex-grow max-w-xs"
                    : key === "Back" || key === "Clear"
                    ? "w-16 sm:w-20"
                    : "w-8 sm:w-12"
                } h-10 sm:h-12 bg-white dark:bg-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium transition-colors text-sm sm:text-base`}
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

const LoginPage = () => {
  // State management
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedKotType, setSelectedKotType] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [isVirtualKeyboard, setIsVirtualKeyboard] = useState(true); // Track keyboard mode

  const [loading,setLoading] = useState(false)

  // Redux and hooks
  const user = useSelector((state) => state.auth.user);
  const [kotTypes, setKotTypes] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  // Handle virtual keyboard input
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
          if (activeInput === "username") {
            setActiveInput("password");
          } else {
            setShowKeyboard(false);
          }
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

  // Handle manual keyboard input
  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input focus
  const handleInputFocus = (inputName) => {
    if (isVirtualKeyboard) {
      setActiveInput(inputName);
      setShowKeyboard(true);
    }
  };

  // Toggle keyboard mode
  const toggleKeyboardMode = () => {
    setIsVirtualKeyboard(!isVirtualKeyboard);
    setShowKeyboard(false);
  };

  // Fetch KOT types
  const getKotTypes = async () => {
    const response = await getRequest("kot-types/?status=isActive");
    if (response.success) {
      setKotTypes(response.data);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getKotTypes();
    }
  }, [isLoggedIn]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      setLoading(true)
      const data = {
        username: formData.username,
        password: formData.password,
      };
      const response = await postRequest("login/", data);
      if (response.success) {
        const role =roles.employee
        dispatch(loginSuccess(response.data,role));
        dispatch(clearCart());
        navigate("/");
      } else {
        toast.error("Something went wrong...");
      }
      setLoading(false)
    }else{
      toast.error("Fill all fields")
    }
  };

  // Handle KOT type selection and proceeding
  const handleKotSelection = (kotType) => {
    setSelectedKotType(kotType);
  };

  const handleProceed = async () => {
    if (selectedKotType && user.employee) {
      const body = {
        kotTypeCode: selectedKotType.Code,
      };
      const response = await patchRequest(
        `employee/update-kot/${user.employee?.code}/`,
        body
      );
      if (response.success) {
        dispatch(
          loginSuccess({
            ...user,
            employee: {
              ...user.employee,
              kotTypeCode: selectedKotType.Code,
            },
          })
        );
        navigate("/");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-8 mb-16">
        {!isLoggedIn ? (
          <>
            <div className="text-center mb-4">
              <div className="flex justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white ">
                  POS Login
                </h1>
                <div className="flex justify-end ">
                  <button
                    onClick={toggleKeyboardMode}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Type size={16} />
                    <span>
                      {isVirtualKeyboard
                        ? "Switch to Manual"
                        : "Switch to Virtual"}
                    </span>
                  </button>
                </div>
              </div>
              {/* <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Welcome back! Please enter your credentials.
              </p> */}
            </div>

            {/* Keyboard Mode Toggle */}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /> */}
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleManualInput}
                    onFocus={() => handleInputFocus("username")}
                    readOnly={isVirtualKeyboard}
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /> */}
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleManualInput}
                    onFocus={() => handleInputFocus("password")}
                    readOnly={isVirtualKeyboard}
                  />
                </div>
              </div>

              {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </a>
                </div>
              </div> */}

<button
  type="submit"
  disabled={loading}
  className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-200
    ${loading 
      ? "bg-blue-400 cursor-not-allowed text-white"
      : "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"}
  `}
>
  {loading ? (
    <>
      <svg
        className="animate-spin h-5 w-5 text-white mr-2"
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Processing...
    </>
  ) : (
    "Sign in"
  )}
</button>

            </form>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Need help?{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Contact support
                </a>
              </p>
              <img className="h-8 sm:h-10" src={Xeno} alt="Xeno logo" />
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Login Successful
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                Please select a Kitchen Order Type to proceed
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kotTypes.map((kotType) => (
                <button
                  key={kotType.Code}
                  onClick={() => handleKotSelection(kotType)}
                  className={`p-3 sm:p-4 rounded-lg border-2 text-center font-semibold transition-all duration-200 text-sm sm:text-base ${
                    selectedKotType?.Code === kotType.Code
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600"
                  }`}
                >
                  {kotType.Name}
                </button>
              ))}
            </div>

            <button
              onClick={handleProceed}
              disabled={!selectedKotType}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 text-sm sm:text-base ${
                selectedKotType
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Proceed
            </button>
          </div>
        )}
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onClose={() => setShowKeyboard(false)}
          isNumeric={activeInput === "password"}
          activeInput={activeInput}
          currentValue={formData[activeInput]}
        />
      )}
    </div>
  );
};

export default LoginPage;
