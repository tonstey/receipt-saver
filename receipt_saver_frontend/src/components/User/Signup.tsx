import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { validate } from "email-validator";
import PasswordValidator from "password-validator";
import PasswordChecklist from "./PasswordChecklist";

import { ImEye, ImEyeBlocked } from "react-icons/im";

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
      }
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
    <>
      {status === "idle" ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div>
              <h1>Username</h1>
              <input
                className="border border-gray-400 w-full rounded px-3 py-2"
                type="text"
                placeholder="Please enter your name."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
            </div>

            <div>
              <h1>Email</h1>
              <input
                className="border border-gray-400 w-full rounded px-3 py-2"
                type="email"
                placeholder="Please enter your email."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </div>

            <div>
              <h1>Password</h1>
              <div className="relative h-fit w-full">
                <input
                  className="border border-gray-400 w-full rounded px-3 py-2"
                  type={showPassword ? "text" : "password"}
                  placeholder="Please enter your password."
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                ></input>
                <div
                  className="absolute top-1/4 right-2 text-lg p-1 rounded hover:cursor-pointer hover:bg-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <ImEyeBlocked /> : <ImEye />}
                </div>
              </div>
            </div>
            {passwordError ? (
              <PasswordChecklist requirements={passwordError} />
            ) : (
              ""
            )}
            <div>
              <h1>Confirm Password</h1>
              <input
                className="border border-gray-400 w-full rounded px-3 py-2"
                type="password"
                placeholder="Please confirm your password."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></input>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              className="bg-black rounded-lg text-white w-full py-3 font-semibold text-lg hover:bg-gray-800 hover:cursor-pointer"
              onClick={() => onSignup()}
            >
              Sign In
            </button>
            {error ? <div className="text-red-600"> {error} </div> : ""}
          </div>
        </div>
      ) : (
        <div>
          <DotLottieReact src="/loading.lottie" loop autoplay />
        </div>
      )}
    </>
  );
}
