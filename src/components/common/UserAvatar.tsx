import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const UserAvatar = ({
  src,
  alt = "User",
  size = "md",
  className,
}: UserAvatarProps) => {
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={cn("text-muted-foreground", iconSizes[size])} />
      )}
    </div>
  );
};

export default UserAvatar;
