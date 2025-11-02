import { useParams } from "react-router";

import CompareModal from "../components/Receipt/Item/CompareModal";
import ReceiptDetail from "../components/Receipt/Detail/ReceiptDetail";
import ReceiptItemList from "../components/Receipt/Item/ReceiptItemList";

import { IoMenu } from "react-icons/io5";

export default function ReceiptPage({
  toggleSidebar,
}: {
  toggleSidebar: Function;
}) {
  const params = useParams();

  return (
    <>
      <div className="relative">
        <IoMenu
          className="absolute top-2 left-5 rounded-xl text-5xl hover:cursor-pointer hover:bg-indigo-200"
          onClick={() => toggleSidebar((prev: boolean) => !prev)}
        />
        <CompareModal />

        <div className="flex w-full flex-col items-center gap-10">
          <ReceiptDetail receiptID={params?.receiptid || ""} />

          <ReceiptItemList receiptID={params?.receiptid || ""} />
        </div>
      </div>
    </>
  );
}
