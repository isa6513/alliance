import {
  ActionEventNotifDto,
  actionsGetEvent,
  NotificationChannel,
  notifsNotifsForEvent,
  notifsReloadNotifDataForEvent,
} from "@alliance/shared/client";
import Button from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import RefreshIcon from "@alliance/shared/ui/icons/RefreshIcon";
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Route } from "../../.react-router/types/src/pages/+types/ActionEventDashboard";
import EmailNotif from "../components/EmailNotif";
import TextNotif from "../components/TextNotif";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { eventId } = params;
  const notifs = await notifsNotifsForEvent({
    path: { id: parseInt(eventId) },
  });

  const event = await actionsGetEvent({
    path: { id: parseInt(eventId) },
  });

  if (!notifs.data || !event.data) {
    throw new Error("Not found");
  }

  return { notifs: notifs.data, event: event.data };
}

const ActionEventDashboard: React.FC = () => {
  const { notifs, event } = useLoaderData<typeof clientLoader>();

  const grouped = groupByChannelAndStatus(notifs);
  const presentChannels = Object.keys(grouped) as Array<keyof typeof grouped>;

  const channelHeaderComponents: Record<NotificationChannel, React.ReactNode> =
    {
      text: (
        <Link
          className="border-red-500/70 border px-2 py-1 rounded-md text-xs hover:bg-red-500/10"
          to={`https://console.twilio.com/us1/monitor/logs/sms`}
        >
          Open Twilio Logs
        </Link>
      ),
      email: (
        <Link
          className="border-red-500/70 border px-2 py-1 rounded-md text-xs hover:bg-red-500/10"
          to={`https://app.mailgun.com/mg/reporting/logs`}
        >
          Open Mailgun Logs
        </Link>
      ),
      push: null,
    };

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    const res = await notifsReloadNotifDataForEvent({
      path: { id: event.id },
    });
    if (res.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 w-full p-6 bg-zinc-100 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <p className="font-bold text-lg">Notifications for {event.title}</p>
          <Button
            onClick={refresh}
            className="!px-2 !py-2"
            disabled={refreshing}
          >
            <RefreshIcon />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-zinc-600">
          {event.notifsSentAt ? (
            <span>Sent at {new Date(event.notifsSentAt).toLocaleString()}</span>
          ) : (
            <span>Waiting to send notifs…</span>
          )}
          <span>•</span>
          <span>{notifs.length} total</span>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {presentChannels.map((channel) => (
          <div key={channel} className="space-y-3">
            <div className="flex items-center gap-2 flex-row">
              <h3 className="font-semibold text-base capitalize">{channel}</h3>
              {channelHeaderComponents[channel]}
            </div>
            {Object.entries(grouped[channel] ?? {})
              .sort((a, b) => statusSort(a[0], b[0]))
              .map(([status, items]) => (
                <Card
                  key={status}
                  style={CardStyle.WhiteSolid}
                  className="gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm capitalize">{status}</p>
                      <span className="text-xs text-zinc-500">
                        {items.length}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((n) =>
                      channel === "email" ? (
                        <EmailNotif key={keyForNotif(n)} notif={n} />
                      ) : channel === "text" ? (
                        <TextNotif key={keyForNotif(n)} notif={n} />
                      ) : null
                    )}
                  </div>
                </Card>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

function keyForNotif(n: ActionEventNotifDto) {
  const mailId = n.mail?.id;
  const mmsId = n.mms?.id;
  // Prefer nested IDs if available; fallback to composite
  return `${n.user.id}-${n.channel}-${mailId ?? mmsId ?? Math.random()}`;
}

function statusSort(a: string, b: string) {
  const order: Record<string, number> = {
    failed: 0,
    undelivered: 1,
    pending: 2,
    queued: 2,
    accepted: 2,
    scheduled: 2,
    sending: 2,
    sent: 3,
    delivered: 3,
  };
  const av = order[a.toLowerCase()] ?? 99;
  const bv = order[b.toLowerCase()] ?? 99;
  if (av !== bv) return av - bv;
  return a.localeCompare(b);
}

function groupByChannelAndStatus(notifs: ActionEventNotifDto[]) {
  const result: Partial<
    Record<
      ActionEventNotifDto["channel"],
      Record<string, ActionEventNotifDto[]>
    >
  > = {};

  for (const n of notifs) {
    const channel = n.channel;
    let status = n.sent ? "sent" : "pending";
    if (channel === "email") {
      const mail = n.mail;
      status = (mail?.status as string) || status;
    } else if (channel === "text") {
      const mms = n.mms;
      status = (mms?.status as string) || status;
    }

    if (!result[channel]) result[channel] = {};
    if (!result[channel][status]) result[channel][status] = [];
    result[channel][status].push(n);
  }

  return result;
}

export default ActionEventDashboard;
