import { useState } from "react";
import { validate } from "email-validator";
import PasswordValidator from "password-validator";

import PasswordChecklist from "./PasswordChecklist";

import { ImEye, ImEyeBlocked } from "react-icons/im";
import { AiOutlineLoading } from "react-icons/ai";

export default function Signup({ setFocus }: { setFocus: Function }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState<any[]>();
  const [showPassword, setShowPassword] = useState(false);

  const passwordValidator = new PasswordValidator();
  passwordValidator
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have at least a digit
    .has()
    .symbols() // Must have at least a symbol
    .has()
    .not()
    .spaces(); // Should not have spaces

  const onPasswordChange = (password: string) => {
    setPassword(password);
    const errorList = passwordValidator.validate(password, { list: true });
    if (Array.isArray(errorList)) {
      setPasswordError(errorList);
    }
  };

  const onSignup = async () => {
    if (!validate(email)) {
      setError("Email is not valid.");
      return;
    }

    if (Array.isArray(passwordError) && passwordError.length != 0) {
      setError("Password does not meet the minimum requirements.");
      return;
    }

    if (password != confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setStatus("loading");

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/createuser/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email.toLowerCase(),
          password: password,
        }),
      },
    );

    setStatus("idle");

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setFocus("login");
  };

  return (
    <div className="relative">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80">
          <AiOutlineLoading className="animate-spin text-6xl text-blue-600" />
        </div>
      )}

      <div
        className={`${status === "loading" ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            {/* Username */}
            <div>
              <h1>Username</h1>
              <input
                className="w-full rounded border border-gray-400 px-3 py-2"
                type="text"
                placeholder="Please enter your name."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <h1>Email</h1>
              <input
                className="w-full rounded border border-gray-400 px-3 py-2"
                type="email"
                placeholder="Please enter your email."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <h1>Password</h1>
              <div className="relative h-fit w-full">
                <input
                  className="w-full rounded border border-gray-400 px-3 py-2"
                  type={showPassword ? "text" : "password"}
                  placeholder="Please enter your password."
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                />
                <div
                  className="absolute top-1/4 right-2 rounded p-1 text-lg hover:cursor-pointer hover:bg-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <ImEyeBlocked /> : <ImEye />}
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {passwordError && passwordError.length > 0 && (
              <PasswordChecklist requirements={passwordError} />
            )}

            {/* Confirm Password */}
            <div>
              <h1>Confirm Password</h1>
              <input
                className="w-full rounded border border-gray-400 px-3 py-2"
                type="password"
                placeholder="Please confirm your password."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-1">
            <button
              className="w-full rounded-lg bg-black py-3 text-lg font-semibold text-white hover:cursor-pointer hover:bg-gray-800"
              onClick={onSignup}
            >
              Sign Up
            </button>
            {error && <div className="mt-2 text-red-600">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
