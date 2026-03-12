'use client';

import React from 'react';

import { useMutation } from '@apollo/client/react';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icon,
  Input,
} from '@/components/ui';
import { PhoneInput } from '@/components/form/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

import { InviteUser } from './_mutation';
import { isValidateEmail, getName } from '@/lib/utils';
import { useAppSelector } from '@/lib';
import { toast } from 'sonner';

interface InviteUserVariables {
  senderFullName?: string;
  email?: string[];
  phone?: string[];
}
interface InviteUserResult {
  inviteUser: boolean;
}

type BaseProps = {
  readonly className?: string;
};

type InviteDialogWithTrigger = BaseProps & {
  trigger: React.ReactNode;
  open?: never;
  onOpenChange?: never;
};

type InviteDialogWithoutTrigger = BaseProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: never;
};

type InviteDialogProps = InviteDialogWithTrigger | InviteDialogWithoutTrigger;

function isValidPhone(value: string): boolean {
  if (!value) return false;
  return isValidPhoneNumber(value);
}

const InviteDialog: React.FC<InviteDialogProps> = ({
  className,
  open,
  onOpenChange,
  trigger,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const senderFullName = getName(user?.first_name, user?.last_name) || undefined;

  const [emailInput, setEmailInput] = React.useState<string>('');
  const [emails, setEmails] = React.useState<string[]>([]);
  const [phoneInput, setPhoneInput] = React.useState<string>('');
  const [phones, setPhones] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);

  const [inviteUserMutation] = useMutation<
    InviteUserResult,
    InviteUserVariables
  >(InviteUser);

  const hasAnyRecipient = emails.length > 0 || phones.length > 0;

  async function onSendInvite(): Promise<void> {
    if (!hasAnyRecipient) return;

    setSending(true);
    try {
      const { data } = await inviteUserMutation({
        variables: {
          senderFullName: senderFullName || undefined,
          email: emails,
          phone: phones,
        },
      });

      if (data?.inviteUser === true) {
        const total = emails.length + phones.length;
        toast.success(
          `Invite${total > 1 ? 's' : ''} sent successfully.`
        );
        setEmails([]);
        setPhones([]);
      } else {
        toast.error('Failed to send invites. Please try again.');
      }
    } catch {
      toast.error('Failed to send invites.');
    } finally {
      setSending(false);
    }
  }

  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && isValidateEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setEmailInput('');
    }
  };

  const addPhone = () => {
    const trimmed = phoneInput.trim();
    if (trimmed && isValidPhone(trimmed) && !phones.includes(trimmed)) {
      setPhones([...phones, trimmed]);
      setPhoneInput('');
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Invite your friends via email or phone to join GolfGuiders.
          </DialogDescription>
        </DialogHeader>

        {/* Email row */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <div className="flex w-full items-center gap-2">
            <Input
              onChange={(e) => setEmailInput(e.target.value)}
              value={emailInput}
              placeholder="friend@example.com"
              wrapperClassName="min-w-0 flex-1"
              className="h-10 rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addEmail();
                }
              }}
            />
            <Button
              size="sm"
              className="h-10 shrink-0 rounded-lg px-5"
              disabled={!isValidateEmail(emailInput.trim())}
              onClick={addEmail}
            >
              <Icon name="plus" size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Phone row */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <div className="flex w-full items-center gap-2">
            <PhoneInput
              value={phoneInput}
              onChange={(value) => setPhoneInput(value || '')}
              defaultCountry="US"
              placeholder="Enter your phone number"
              className="min-w-0 flex-1"
            />
            <Button
              size="sm"
              className="h-10 shrink-0 rounded-lg px-5"
              disabled={!isValidPhone(phoneInput)}
              onClick={addPhone}
            >
              <Icon name="plus" size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Emails & phones list */}
        <div className="min-h-[100px] max-h-40 overflow-y-auto rounded-lg border border-border/50 bg-muted/30 p-3">
          {!hasAnyRecipient ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-6">
              <Icon name="mail" size={24} className="mb-2 opacity-40" />
              <span>No emails or phones added yet</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {emails.map((email, ind) => (
                <Badge
                  key={`e-${ind}`}
                  variant="secondary"
                  className="gap-1.5 pl-3 pr-1.5 py-1.5 text-xs font-normal"
                >
                  {email}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setEmails(emails.filter((f) => f !== email))}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </Badge>
              ))}
              {phones.map((phone, ind) => (
                <Badge
                  key={`p-${ind}`}
                  variant="secondary"
                  className="gap-1.5 pl-3 pr-1.5 py-1.5 text-xs font-normal"
                >
                  {phone}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setPhones(phones.filter((f) => f !== phone))}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Send button */}
        <Button
          className="w-full rounded-lg h-10"
          type="button"
          disabled={sending || !hasAnyRecipient}
          onClick={() => onSendInvite()}
        >
          {sending ? (
            <>
              <Icon name="load" size={16} className="mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Icon name="send" size={16} className="mr-2" />
              Send Invite{hasAnyRecipient ? ` (${emails.length + phones.length})` : ''}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export { InviteDialog };
