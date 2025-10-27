import { useState, useEffect } from "react";

import { LuReceipt } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { FaArrowTrendUp, FaArrowRightLong } from "react-icons/fa6";
import { IoCalendarClearOutline, IoMenu } from "react-icons/io5";
import { BiDollar } from "react-icons/bi";

import Authentication from "../components/User/Authentication";
import RecentReceipt from "../components/Home/RecentReceipt";

import { useUserState } from "../state/authcomp";
import { useNavigate } from "react-router";
import { getCookie } from "../lib/get_token";
import { type Receipt } from "../lib/modelinterfaces";

export default function HomePage({
  toggleSidebar,
}: {
  toggleSidebar: Function;
}) {
  const [receiptError, setReceiptError] = useState("");
  const [figureError, setFigureError] = useState("");
  const [receiptStatus, setReceiptStatus] = useState<"idle" | "loading">(
    "idle",
  );
  const [figureStatus, setFigureStatus] = useState<"idle" | "loading">("idle");

  const [recentReceipts, setRecentReceipts] = useState<Receipt[] | null>(null);
  const [figures, setFigures] = useState<{
    monthlyspent: number;
    savings: number;
  }>({ monthlyspent: 0, savings: 0 });

  const user = useUserState((state) => state.user);
  const openAuth = useUserState((state) => state.setAuthenticateActive);
  const resetDisplay = useUserState((state) => state.resetDisplayReceipt);

  const navigate = useNavigate();
  console.log(figures);

  useEffect(() => {
    resetDisplay();

    const getHomepageData = async () => {
      if (user.username) {
        setReceiptError("");
        setFigureError("");

        setReceiptStatus("loading");
        setFigureStatus("loading");

        const token = getCookie("csrftoken");
        if (!token) {
          setReceiptError("Missing cookies.");
          setFigureError("Missing cookies.");
          return;
        }
        const res = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/figures`, {
            credentials: "include",
            headers: { "X-CSRFToken": token },
          }),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/getreceipts?limit=3&dateordertype=created_at`,
            {
              credentials: "include",
              headers: { "X-CSRFToken": token },
            },
          ),
        ]);

        setReceiptStatus("idle");
        const figureData = await res[0].json();

        setFigureStatus("idle");
        const receiptsData = await res[1].json();

        console.log(figureData);
        if (!res[0].ok) {
          setFigureError(figureData.error);
        } else {
          setFigures(figureData);
        }

        if (!res[1].ok) {
          setReceiptError(receiptsData.error);
        } else {
          setRecentReceipts(receiptsData);
        }

        if (!res[0].ok || !res[1].ok) {
          return;
        }
      } else {
        setRecentReceipts(null);
        setFigures({ monthlyspent: 0, savings: 0 });
      }
    };

    getHomepageData();
  }, [user]);

  const onStart = () => {
    if (user.username) {
      navigate("/scanreceipt");
      return;
    }

    openAuth();
  };

  return (
    <>
      <div className="relative mb-12 flex w-full flex-col items-center gap-10">
        {/* BEGIN OFF DOM ELEMENTS */}
        <Authentication />
        <IoMenu
          className="absolute top-2 left-5 rounded-xl text-5xl hover:cursor-pointer hover:bg-indigo-200"
          onClick={() => toggleSidebar((prev: boolean) => !prev)}
        />
        {/* END OFF DOM ELEMENTS */}

        <div className="mt-16 flex flex-col items-center gap-2">
          <h1 className="text-5xl font-extrabold">Smart Receipt Management</h1>
          <h1 className="text-lg text-gray-700">
            Scan, organize, and compare your purchases across different stores.
            Never lose track of your spending again
          </h1>
        </div>

        <button
          className="flex items-center gap-6 rounded-lg bg-black px-6 py-2 text-lg text-white hover:cursor-pointer"
          onClick={() => onStart()}
        >
          Get Started
          <FaArrowRightLong />
        </button>

        <div className="flex flex-col items-center gap-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex w-76 flex-col items-center rounded-xl bg-white px-6 py-6">
              <LuReceipt className="mb-4 text-5xl text-blue-600" />
              <h1 className="text-lg font-semibold">Smart Scanning</h1>
              <h1 className="text-center text-gray-600">
                Automatically extract items and prices from receipt photos using
                advanced OCR technology
              </h1>
            </div>

            <div className="flex w-76 flex-col items-center rounded-xl bg-white px-6 py-6">
              <BsBoxSeam className="mb-4 text-5xl text-green-600" />
              <h1 className="text-lg font-semibold">Easy Organization</h1>
              <h1 className="text-center text-gray-600">
                Keep all your receipts organized by store, date, and category
                with powerful search features
              </h1>
            </div>

            <div className="flex w-76 flex-col items-center rounded-xl bg-white px-6 py-6">
              <FaArrowTrendUp className="mb-4 text-5xl text-purple-600" />
              <h1 className="text-lg font-semibold">Price Comparison</h1>
              <h1 className="text-center text-gray-600">
                Compare prices across different stores to find the best deals
                and save money
              </h1>
            </div>
          </div>

          <div className="w-full rounded-xl bg-white px-8 py-12">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <IoCalendarClearOutline className="text-xl" />
                <h1 className="text-xl font-semibold">Recent Activity</h1>
              </div>
              <h1 className="text-sm text-gray-600">
                Your latest scanned receipts and spending insights
              </h1>
            </div>

            {receiptStatus === "idle" ? (
              <div className="mt-4 flex flex-col rounded-xl bg-gray-100">
                {recentReceipts ? (
                  recentReceipts.length > 0 ? (
                    recentReceipts.map((item) => (
                      <RecentReceipt key={item.receipt_uuid} receipt={item} />
                    ))
                  ) : (
                    <div className="text-center font-semibold">
                      Scan a receipt to view your most recent receipts!
                    </div>
                  )
                ) : (
                  <div className="text-center font-semibold">
                    Login to view your most recent receipts!
                  </div>
                )}
              </div>
            ) : (
              ""
            )}
            {receiptError ? (
              <div className="text-center text-red-600">{receiptError}</div>
            ) : (
              ""
            )}

            <hr className="my-8 h-2 w-full text-black"></hr>

            {figureStatus === "idle" ? (
              <div className="flex w-full items-center">
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <BiDollar className="text-2xl text-green-600" />
                    <h1 className="text-lg font-semibold">
                      ${figures.monthlyspent.toFixed(2)}
                    </h1>
                  </div>
                  <h1 className="text-sm font-semibold text-gray-600">
                    Total Spent This Month
                  </h1>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <LuReceipt className="text-2xl text-blue-600" />
                    <h1 className="text-lg font-semibold">
                      {user.num_receipts}
                    </h1>
                  </div>
                  <h1 className="text-sm font-semibold text-gray-600">
                    Receipts Scanned
                  </h1>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <FaArrowTrendUp className="text-2xl text-purple-600" />
                    <h1 className="text-lg font-semibold">
                      ${figures.savings.toFixed(2)}
                    </h1>
                  </div>
                  <h1 className="text-sm font-semibold text-gray-600">
                    Potential Savings Found
                  </h1>
                </div>
              </div>
            ) : (
              ""
            )}
            {figureError ? (
              <div className="mt-2 text-center text-red-600">{figureError}</div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );
}
