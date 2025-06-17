// Utility function to format dates in 'YYYY-MM-DD HH:mm:ss' format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Format options for 'YYYY-MM-DD HH:mm:ss'
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const formattedDate = formatter.format(date);

  // Reformat to 'YYYY-MM-DD HH:mm:ss'
  const [day, month, year, hours, minutes, seconds] = formattedDate.match(/\d+/g) || [];
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}