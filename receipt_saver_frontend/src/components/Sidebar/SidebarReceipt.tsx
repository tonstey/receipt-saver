import { useNavigate } from "react-router";

import { IoCalendarClearOutline } from "react-icons/io5";
import { LuReceipt } from "react-icons/lu";
import { stringToDate } from "../../lib/date";
import { useUserState } from "../../state/authcomp";

export default function SidebarReceipt({ receipt }: { receipt: any }) {
  const navigate = useNavigate();
  const currProduct = useUserState((state) => state.displayReceipt);

  return (
    <>
      <div
        className={`hover:cursor-pointer w-full rounded-lg py-2 px-4 flex flex-col gap-0.25 ${
          "receipt_uuid" in currProduct
            ? currProduct?.receipt_uuid === receipt.receipt_uuid
              ? "bg-gray-300"
              : "hover:bg-gray-100"
            : "hover:bg-gray-100"
        }`}
        onClick={() => navigate(`/receipt/${receipt.receipt_uuid}`)}
      >
        <div className="flex items-center gap-1">
          <LuReceipt className="text-lg" />
          <h1 className="font-semibold">{receipt.name}</h1>
        </div>

        <div className="flex justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <IoCalendarClearOutline />
            <h1>{stringToDate(receipt.date_purchased)}</h1>
          </div>
          <div>
            <h1>${receipt.total}</h1>
          </div>
        </div>

        <h1 className="text-gray-600 text-sm">{receipt.num_items} items</h1>
      </div>
    </>
  );
}
