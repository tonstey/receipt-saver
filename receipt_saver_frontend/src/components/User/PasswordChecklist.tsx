import { RxCheck, RxCross2 } from "react-icons/rx";

export default function PasswordChecklist({
  requirements,
}: {
  requirements: any[];
}) {
  return (
    <>
      <div className="border border-gray-400 rounded-lg bg-gray-50 px-4 py-2">
        <h1 className="text-sm font-semibold">Password Requirements:</h1>
        <div>
          <div
            className={`flex items-center gap-1 text-sm ${
              requirements.includes("min") || requirements.includes("max")
                ? "text-gray-400"
                : "text-green-600"
            }`}
          >
            {requirements.includes("min") || requirements.includes("max") ? (
              <RxCross2 />
            ) : (
              <RxCheck />
            )}
            <h1>Must be between 8 and 100 characters</h1>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${
              requirements.includes("spaces")
                ? "text-gray-400"
                : "text-green-600"
            }`}
          >
            {requirements.includes("spaces") ? <RxCross2 /> : <RxCheck />}
            <h1>Must not have spaces</h1>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${
              requirements.includes("lowercase")
                ? "text-gray-400"
                : "text-green-600"
            }`}
          >
            {requirements.includes("lowercase") ? <RxCross2 /> : <RxCheck />}
            <h1>Contains lowercase letter</h1>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${
              requirements.includes("uppercase")
                ? "text-gray-400"
                : "text-green-600"
            }`}
          >
            {requirements.includes("uppercase") ? <RxCross2 /> : <RxCheck />}
            <h1>Contains uppercase letter</h1>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${
              requirements.includes("digits")
                ? "text-gray-400"
                : "text-green-600"
            }`}
          >
            {requirements.includes("digits") ? <RxCross2 /> : <RxCheck />}
            <h1>Contains a number</h1>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${
              requirements.includes("symbols")
                ? "text-gray-400"
                : "text-green-600"
            }`}
          >
            {requirements.includes("symbols") ? <RxCross2 /> : <RxCheck />}
            <h1>Contains a special character</h1>
          </div>
        </div>
      </div>
    </>
  );
}
