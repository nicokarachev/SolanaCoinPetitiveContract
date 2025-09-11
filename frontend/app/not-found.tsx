// app/not-found.tsx
import { redirect } from "next/navigation";

export default function NotFoundRedirect() {
  redirect("/"); // or any route you want
}
