export default async function get_token() {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/csrf/`, {
    credentials: "include",
  });

  if (!res.ok) {
    console.log("Error while receiving token.");
    return null;
  }

  const data = await res.json();

  return data.csrf_token;
}

export function getCookie(name: any) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }

  if (!cookieValue) {
    console.log("Error in fetching cookie");
  }

  return cookieValue;
}
