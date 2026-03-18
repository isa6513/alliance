type MemberContactActionParams = {
  email: string;
  phone: string;
};

const CONTACT_ACTIONS = [
  {
    id: "profile",
    label: "Profile",
    accessibilityLabel: "View profile",
    isDisabled: ({}: { email: string; phone: string }) => false,
  },
  {
    id: "email",
    label: "Email",
    accessibilityLabel: "Send email",
    isDisabled: ({ email }: { email: string; phone: string }) => !email.trim(),
  },
  {
    id: "call",
    label: "Call",
    accessibilityLabel: "Call",
    isDisabled: ({ phone }: { email: string; phone: string }) => !phone.trim(),
  },
  {
    id: "text",
    label: "Text",
    accessibilityLabel: "Text",
    isDisabled: ({ phone }: { email: string; phone: string }) => !phone.trim(),
  },
  {
    id: "message",
    label: "Message",
    accessibilityLabel: "Message",
    isDisabled: ({}: { email: string; phone: string }) => false,
  },
] as const satisfies {
  id: string;
  label: string;
  accessibilityLabel: string;
  isDisabled: (params: MemberContactActionParams) => boolean;
}[];

export type MemberContactActionDescriptor = {
  [A in (typeof CONTACT_ACTIONS)[number] as A["id"]]: {
    id: A["id"];
    label: A["label"];
    accessibilityLabel: A["accessibilityLabel"];
    disabled: boolean;
  };
}[(typeof CONTACT_ACTIONS)[number]["id"]];

export function getMemberContactActionDescriptors(
  params: MemberContactActionParams,
): MemberContactActionDescriptor[] {
  return CONTACT_ACTIONS.map((contactAction) => {
    return {
      ...contactAction,
      disabled: contactAction.isDisabled(params),
    } satisfies MemberContactActionDescriptor;
  });
}
