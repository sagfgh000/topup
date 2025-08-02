
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Hand, ShieldAlert } from 'lucide-react';

type AgreementDialogProps = {
    onAgree: () => void;
    onLogout: () => void;
};

export function AgreementDialog({ onAgree, onLogout }: AgreementDialogProps) {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Hand className="h-6 w-6 text-primary" />
            User Agreement
          </DialogTitle>
          <DialogDescription>
            Please read and agree to the terms before continuing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm text-foreground">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <AlertTitle className="font-bold">Important Terms</AlertTitle>
                <AlertDescription>
                   <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>
                            <strong>Wrong UID:</strong> If you enter a wrong Player ID (UID) and the diamond top-up is sent to the wrong account, the administration will not be responsible and no refund will be issued. Please double-check your UID carefully before ordering.
                        </li>
                        <li>
                            <strong>Server Region:</strong> This service is available only for the <strong>Bangladesh</strong> server. Orders for other servers will not be processed.
                        </li>
                   </ul>
                </AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
                By clicking "I Agree", you acknowledge that you have read, understood, and accepted these terms and conditions.
            </p>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onLogout}>
            Disagree & Logout
          </Button>
          <Button type="button" onClick={onAgree}>
            I Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add hideCloseButton prop to DialogContent component
const OriginalDialogContent = require('@/components/ui/dialog').DialogContent;
const X = require('lucide-react').X;
const cn = require('@/lib/utils').cn;
const DialogPortal = require('@/components/ui/dialog').DialogPortal;
const DialogOverlay = require('@/components/ui/dialog').DialogOverlay;
const DialogPrimitive = require('@radix-ui/react-dialog');


// Monkey-patching DialogContent to add a prop to hide the close button.
// This is a workaround to avoid editing the library file directly.
(Dialog as any).Content = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
      onInteractOutside={(e) => {
          e.preventDefault();
      }}
    >
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));

