export function dateToString(
  stringDate: string,
  year: number,
  month: number,
  day: number,
) {
  const splicedDate = stringDate.slice(10);
  const strMonth = month >= 10 ? String(month) : `0${month}`;
  const strDay = day >= 10 ? String(day) : `0${day}`;

  return `${year}-${strMonth}-${strDay}${splicedDate}`;
}

export function stringToDate(stringDate: string) {
  "2025-09-20T04:14:53.987274Z";
  const date = stringDate.slice(0, 10);

  const dateNums = date.split("-");
  return `${dateNums[1]}/${dateNums[2]}/${dateNums[0]}`;
}

export function currentDateString() {
  const date = new Date(Date.now());

  const strMonth =
    date.getMonth() + 1 >= 10
      ? String(date.getMonth() + 1)
      : `0${date.getMonth() + 1}`;
  const strDay =
    date.getDate() >= 10 ? String(date.getDate()) : `0${date.getDate()}`;

  return `${date.getFullYear()}-${strMonth}-${strDay}T04:14:53.987274Z`;
}

export function timeSinceDateString(time: number) {
  const seconds = time / 1000;

  const days = Math.floor(seconds / 86400);

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);
  if (months > 0) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(months / 12);
  if (years > 0) {
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }

  return "0 days ago";
}
