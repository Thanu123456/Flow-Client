// Inline SVG placeholder for product / stock thumbnails.
//
// Replaces the old `https://via.placeholder.com/*` URLs — that service is
// unreachable (net::ERR_CONNECTION_CLOSED), which spammed the console and left
// broken <img> icons wherever a product had no image. A data URI needs no
// network and scales to any rendered size.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2040%2040'%3E%3Crect%20width='40'%20height='40'%20fill='%23f5f5f5'/%3E%3Cpath%20d='M6%2030l8-9%205%206%204-4%2011%2011H6z'%20fill='%23d9d9d9'/%3E%3Ccircle%20cx='14'%20cy='14'%20r='3'%20fill='%23d9d9d9'/%3E%3C/svg%3E";
