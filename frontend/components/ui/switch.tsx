import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils"; // helper for className merging

export function Switch({ className, ...props }: RadixSwitch.SwitchProps) {
  return (
    <RadixSwitch.Root
      className={cn(
        "w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-[#B3731D] transition-colors",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 translate-x-1 data-[state=checked]:translate-x-5" />
    </RadixSwitch.Root>
  );
}
