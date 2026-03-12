import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a14]">
      <SignUp
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
