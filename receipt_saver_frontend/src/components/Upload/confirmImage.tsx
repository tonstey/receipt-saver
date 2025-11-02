import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { getCookie } from "../../lib/get_token";

import { FaArrowLeftLong, FaCheck } from "react-icons/fa6";
import { useUserState } from "../../state/authcomp";
import { AiOutlineLoading } from "react-icons/ai";

export default function ConfirmImage({
  image,
  reupload,
}: {
  image: File | null;
  reupload: Function;
}) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [previewLink, setPreviewLink] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const refreshReceiptList = useUserState(
    (state) => state.setRefreshPlaceholder,
  );

  const setUser = useUserState((state) => state.setUser);

  useEffect(() => {
    if (image) {
      const imgUrl = URL.createObjectURL(image);
      setPreviewLink(imgUrl);

      return () => URL.revokeObjectURL(imgUrl);
    }
  }, [image]);

  const handleUploadReceipt = async () => {
    if (!image) {
      return;
    }
    setStatus("loading");
    const token = getCookie("csrftoken");
    if (!token) {
      return;
    }

    const form = new FormData();
    form.append("file", image);

    const resImage = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/createreceipt/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": token,
        },
        body: form,
      },
    );

    const dataImage = await resImage.json();

    if (!resImage.ok) {
      setStatus("idle");
      setError(dataImage.error);
      return;
    }

    const resUser = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRFToken": token,
        },
      },
    );

    const dateUser = await resUser.json();

    if (!resUser.ok) {
      return;
    }
    setUser(dateUser);
    navigate(`/receipt/${dataImage.receipt_uuid}`);
    refreshReceiptList();
  };

  const handleReupload = () => {
    reupload("idle");
  };

  return (
    <>
      {status === "idle" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8 overflow-y-auto py-16 md:justify-start">
          <div className="flex flex-col items-center">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Receipt Preview
              </h1>
              <h1 className="text-gray-600">
                Make sure the receipt is clear and all text is readable
              </h1>
            </div>
            <img className="w-[80%] rounded-xl border" src={previewLink}></img>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-1">
            <div className="flex w-[80%] justify-center gap-6">
              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2 text-xl font-semibold hover:cursor-pointer hover:bg-gray-100"
                onClick={() => handleReupload()}
              >
                <FaArrowLeftLong />
                Go Back
              </button>
              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-black px-6 py-2 text-xl font-semibold text-white hover:cursor-pointer hover:bg-gray-800"
                onClick={() => handleUploadReceipt()}
              >
                <FaCheck />
                Confirm
              </button>
            </div>
            {error ? <div className="text-red-600"> {error} </div> : ""}
          </div>
        </div>
      ) : (
        <div>
          <AiOutlineLoading className="animate-spin text-8xl text-blue-600" />
        </div>
      )}
    </>
  );
}
