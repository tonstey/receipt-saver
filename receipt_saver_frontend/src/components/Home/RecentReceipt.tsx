import { GoDotFill } from "react-icons/go";
import { LuReceipt } from "react-icons/lu";
import { timeSinceDateString } from "../../lib/date";
import { useNavigate } from "react-router";

export default function RecentReceipt({ receipt }: { receipt: any }) {
  const receiptDate = new Date(receipt.date_purchased);
  const currentDate = new Date(Date.now());

  const dateDifference = Math.abs(
    currentDate.getTime() - receiptDate.getTime(),
  );

  const navigate = useNavigate();

  return (
    <>
      <div
        className="flex items-center justify-between rounded-xl px-5 py-4 hover:cursor-pointer hover:bg-gray-200"
        onClick={() => navigate(`/receipt/${receipt.receipt_uuid}`)}
      >
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-200 p-2">
            <LuReceipt className="text-2xl text-blue-600" />
          </div>
          <div>
            <h1 className="font-semibold">{receipt.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <h1>{receipt.num_items} items</h1>
              <GoDotFill className="text-xs" />
              <h1>{timeSinceDateString(dateDifference)}</h1>
            </div>
          </div>
        </div>

        <h1 className="font-semibold">${receipt.total.toFixed(2)}</h1>
      </div>
    </>
  );
}
