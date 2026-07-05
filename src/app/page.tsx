import { redirect } from "next/navigation";

// The middleware sends unauthenticated visitors to /login; authenticated
// visitors continue to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
