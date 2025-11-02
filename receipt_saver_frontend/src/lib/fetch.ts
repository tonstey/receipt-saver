import { get_token, getCookie } from "./get_token";

export async function getReceipts(limit: number) {
  let token = getCookie("csrftoken");
  if (!token) {
    token = await get_token();
  }

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/getreceipts/?limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "X-CSRFToken": token ?? "",
      },
    },
  );

  const data = await res.json();
  if (!res.ok) {
    return { error: data.error };
  }

  return { data: data };
}
