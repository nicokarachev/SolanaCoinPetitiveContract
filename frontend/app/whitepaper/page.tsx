import Whitepaper from "@/components/whitepaper";
import BackButton from "@/components/BackButton";

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <BackButton />
      <Whitepaper />
    </div>
  );
}
