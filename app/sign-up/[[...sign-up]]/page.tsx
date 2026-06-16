import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">קורס הלינקדאין של</h1>
        <Image className="auth-logo" src="/brand/nav-logo.png" alt="OctaLoom" width={150} height={37} priority />
        <p className="auth-sub">הירשמו כדי לקבל גישה לקורס ולכלים</p>
        <SignUp />
      </div>
    </div>
  );
}
