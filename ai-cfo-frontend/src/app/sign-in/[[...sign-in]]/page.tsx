import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a14]">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#0a1120] border border-white/10 shadow-2xl shadow-blue-500/5",
          },
        }}
      />
    </div>
  );
}
