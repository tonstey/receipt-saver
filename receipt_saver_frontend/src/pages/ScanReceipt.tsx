import { MdOutlinePhotoCamera, MdFileUpload } from "react-icons/md";
import { IoMenu } from "react-icons/io5";

import { useUserState } from "../state/authcomp";
import { useEffect, useState, type ChangeEvent } from "react";
import ConfirmImage from "../components/Upload/confirmImage.tsx";

export default function ScanReceipt({
  toggleSidebar,
}: {
  toggleSidebar: Function;
}) {
  const [status, setStatus] = useState<
    "idle" | "confirm" | "success" | "error"
  >("idle");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const resetDisplay = useUserState((state) => state.resetDisplayReceipt);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList) {
      setError("There are no files");
      return;
    }

    setInputImage(fileList[0]);
    setStatus("confirm");
  };

  useEffect(() => {
    resetDisplay();
  }, []);

  return (
    <>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <IoMenu
          className="absolute top-2 left-5 rounded-xl text-5xl hover:cursor-pointer hover:bg-indigo-200"
          onClick={() => toggleSidebar((prev: boolean) => !prev)}
        />
        {status === "idle" ? (
          <div>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold">Scan Receipt</h1>
              <h1 className="text-lg text-gray-600">
                Take a photo or upload an image of your receipt
              </h1>
            </div>

            <div className="mt-4 flex w-[32rem] flex-col items-center gap-6 rounded-lg bg-white p-6">
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-semibold">Upload Receipt Photo</h1>
                <h1 className="text-gray-600">
                  Choose how you'd like to add your receipt
                </h1>
              </div>
              <div className="flex w-full flex-col gap-3">
                <button className="flex items-center justify-center gap-3 rounded-xl bg-black py-3 text-xl font-semibold text-white hover:cursor-pointer hover:bg-gray-700">
                  <MdOutlinePhotoCamera className="text-2xl" />
                  Take Photo
                </button>

                <label
                  className="flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-gray-100 py-3 text-xl font-semibold text-black hover:cursor-pointer hover:bg-gray-200"
                  htmlFor="receiptupload"
                >
                  <MdFileUpload className="text-2xl" />
                  Upload from Gallery
                </label>
                <input
                  type="file"
                  id="receiptupload"
                  onChange={(e) => handleFile(e)}
                  hidden
                />
              </div>

              {error ? <div className="text-red-600"> {error} </div> : ""}

              <div className="flex flex-col items-center">
                <h1 className="text-lg font-semibold text-gray-600">
                  Tips for better scanning:
                </h1>
                <ul className="flex list-disc flex-col items-center text-sm">
                  <li>Ensure good lighting</li>
                  <li>Keep receipt flat and straight</li>
                  <li>Include the entire receipt in frame</li>
                  <li>Avoid shadows and glare</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <ConfirmImage image={inputImage} reupload={setStatus} />
        )}
      </div>
    </>
  );
}
