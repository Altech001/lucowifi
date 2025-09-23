'use client';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';

type Props = ComponentProps<typeof Button> & {
  children: React.ReactNode;
};

export function SubmitButton({ children, ...props }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
