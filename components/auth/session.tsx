import { getSession } from "@/lib/session";
import { SignIn } from "./sign-in";

export default async function Session() {
  const sessionData = await getSession();

  if (!sessionData?.session || !sessionData.user) {
    return <SignIn />;
  }

  return (
    <div>
      <h6>{sessionData.user.name}</h6>
    </div>
  );
}
