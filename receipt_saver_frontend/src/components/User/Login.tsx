import { useState } from "react";
import { useUserState } from "../../state/authcomp";
import get_token, { getCookie } from "../../lib/get_token";
import { ImEye, ImEyeBlocked } from "react-icons/im";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router";

export default function Login() {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const setUser = useUserState((state) => state.setUser);
  const setIsOpen = useUserState((state) => state.setAuthenticateActive);
  const refreshFunction = useUserState((state) => state.setRefreshPlaceholder);

  const navigate = useNavigate();

  const onLogin = async () => {
    setError("");
    setStatus("loading");

    if (!username || !password) {
      setError("Missing fields.");
      return;
    }

    const token = await get_token();
    if (!token) {
      setError("Missing cookies.");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({ username: username, password: password }),
    });

    const data = await res.json();
    setStatus("idle");

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setUser(data);
    refreshFunction();
    setIsOpen();
    navigate("/");
  };

  return (
    <>
      {status === "idle" ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div>
              <h1>Username</h1>
              <input
                className="w-full rounded border border-gray-400 px-3 py-2"
                type="text"
                placeholder="Please enter your username."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
            </div>

            <div>
              <h1>Password</h1>
              <div className="relative">
                <input
                  className="w-full rounded border border-gray-400 px-3 py-2"
                  type={showPassword ? "text" : "password"}
                  placeholder="Please enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
                <div
                  className="absolute top-1/4 right-2 rounded p-1 text-lg hover:cursor-pointer hover:bg-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <ImEyeBlocked /> : <ImEye />}
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              className="w-full rounded-lg bg-black py-3 text-lg font-semibold text-white hover:cursor-pointer hover:bg-gray-800"
              onClick={() => onLogin()}
              onKeyDown={(e) => (e.key === "Enter" ? onLogin() : "")}
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
