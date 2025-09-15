import { ActionEventNotifDto, ProfileDto } from "@alliance/shared/client";
import Badge from "@alliance/shared/ui/Badge";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React from "react";

function statusClasses(status?: string) {
  const s = (status || "").toString().toLowerCase();
  if (s === "sent") return "bg-green-100 text-green-800";
  if (s === "failed") return "bg-red-100 text-red-800";
  if (s === "pending") return "bg-yellow-100 text-yellow-800";
  return "bg-stone-200 text-gray-800";
}

export interface EmailNotifProps {
  notif: ActionEventNotifDto;
}

const EmailNotif: React.FC<EmailNotifProps> = ({ notif }) => {
  const user: ProfileDto = notif.user;
  const mail = notif.mail;

  if (!mail) {
    return (
      <Card style={CardStyle.White}>
        <p>No data</p>
      </Card>
    );
  }

  return (
    <Card style={CardStyle.White}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{user.displayName}</p>
            <span className="text-xs text-zinc-500">{mail.to}</span>
          </div>
          {mail.sentMessageId && (
            <span className="text-xs text-zinc-500 wrap-anywhere">
              {mail.sentMessageId}
            </span>
          )}
        </div>
        <Badge className={`${statusClasses(mail.status)}`}>{mail.status}</Badge>
      </div>
      <p className="text-xs text-zinc-500">
        {new Date(mail.createdAt).toLocaleString()}
      </p>
    </Card>
  );
};

export default EmailNotif;
