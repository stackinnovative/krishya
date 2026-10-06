import { v4 as uuid } from "uuid";

export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let guestId = window.localStorage.getItem("guestId");
  if (!guestId) {
    guestId = uuid();
    window.localStorage.setItem("guestId", guestId);
  }
  return guestId;
}
