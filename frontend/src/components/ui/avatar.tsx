import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, ...props }, ref) => {
  const [objectUrl, setObjectUrl] = React.useState<string | undefined>(undefined);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    if (!src) {
      setObjectUrl(undefined);
      return;
    }
    
    // If it's a data URI or external URL (not our API), just use it directly
    if (src.startsWith('data:') || (src.startsWith('http') && !src.includes('/api/auth/avatar'))) {
      setObjectUrl(src);
      return;
    }

    const fetchImage = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(src, { headers });
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        if (!mounted) return;
        
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        setHasError(false);
      } catch (error) {
        if (mounted) {
          setHasError(true);
        }
      }
    };

    fetchImage();

    return () => {
      mounted = false;
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (hasError || !objectUrl) return null; // Let AvatarFallback render

  return (
    <AvatarPrimitive.Image
      ref={ref}
      src={objectUrl}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
