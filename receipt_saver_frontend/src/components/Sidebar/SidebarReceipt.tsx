import { useNavigate } from "react-router";

import { IoCalendarClearOutline } from "react-icons/io5";
import { LuReceipt } from "react-icons/lu";
import { stringToDate } from "../../lib/date";
import { useUserState } from "../../state/authcomp";

export default function SidebarReceipt({
  receipt,
  toggleSidebar,
}: {
  receipt: any;
  toggleSidebar: Function;
}) {
  const navigate = useNavigate();
  const currProduct = useUserState((state) => state.displayReceipt);

  return (
    <>
      <div
        className={`flex w-full flex-col gap-0.25 rounded-lg px-4 py-2 hover:cursor-pointer ${
          "receipt_uuid" in currProduct
            ? currProduct?.receipt_uuid === receipt.receipt_uuid
              ? "bg-gray-300"
              : "hover:bg-gray-100"
            : "hover:bg-gray-100"
        }`}
        onClick={() => {
          toggleSidebar(false);
          navigate(`/receipt/${receipt.receipt_uuid}`);
        }}
      >
        <div className="flex items-center gap-1">
          <LuReceipt className="flex-shrink-0 text-lg" />
          <h1 className="overflow- truncate font-semibold">{receipt.name}</h1>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <IoCalendarClearOutline />
            <h1>{stringToDate(receipt.date_purchased)}</h1>
          </div>
          <div>
            <h1>${receipt.total.toFixed(2)}</h1>
          </div>
        </div>

        <h1 className="text-sm text-gray-600">{receipt.num_items} items</h1>
      </div>
    </>
  );
}
