// Strongly-typed PostHog event names, shared across server, web, and mobile.
export enum AnalyticsEvent {
  // Actions
  ActionCompleted = "action_completed",
  FormStarted = "form_started",

  // Forms
  FormPageViewed = "form_page_viewed",
  FormPageExited = "form_page_exited",
  FormValidationError = "form_validation_error",

  // Video
  VideoSeen = "video_seen",
  VideoStarted = "video_started",
  VideoProgress = "video_progress",
  VideoFullyWatched = "video_fully_watched",

  // Activities / forum
  ActivityLiked = "activity_liked",
  ForumCommentLiked = "forum_comment_liked",

  // Notifications
  NotificationClicked = "notification_clicked",
  NotificationReadViaClick = "notification_read_via_click",
  NotificationMarkedRead = "notification_marked_read",
  NotificationsMarkedAllAsRead = "notifications_marked_all_as_read",
  NotifLinkClick = "notif_link_click",

  // Signup / invites
  InvitePageOpened = "invite_page_opened",
  NewUser = "new_user",
  SidLoad = "sid_load",

  // Auth
  AuthFailedToRefresh = "auth_failed_to_refresh",
  Login = "login",
  Logout = "logout",

  // Visible actions (server-side). Each is forwarded to Slack.
  ForumPostCreated = "forum_post_created",
  ForumCommentCreated = "forum_comment_created",
  ForumPostLiked = "forum_post_liked",
  ForumPostUnliked = "forum_post_unliked",
  ForumCommentUnliked = "forum_comment_unliked",
  ActivityCommentCreated = "activity_comment_created",
  ActivityUnliked = "activity_unliked",
  ActionOptedOut = "action_opted_out",
  ContractSigned = "contract_signed",
  ContractSuspended = "contract_suspended",
  CommunityCreated = "community_created",
  CommunityJoined = "community_joined",
  CommunityLeft = "community_left",
  FriendRequestSent = "friend_request_sent",
  FriendRequestAccepted = "friend_request_accepted",
  FriendRemoved = "friend_removed",
  ConversationCreated = "conversation_created",
  MessageSent = "message_sent",

  // Email (Mailgun webhook). Unrecognized Mailgun event types fall back to a
  // dynamic `email<event>` name
  EmailDelivered = "emaildelivered",
  EmailOpened = "emailopened",
  EmailClicked = "emailclicked",
  EmailBounced = "emailbounced",
  EmailComplained = "emailcomplained",
  EmailUnsubscribed = "emailunsubscribed",

  // Server
  DbSlowQuery = "db.slow_query",
}

// Strongly-typed labels for exceptions reported via `captureException`.
export enum ExceptionEvent {
  FormSubmitError = "form_submit_error",
  FollowUpFormSubmitError = "follow_up_form_submit_error",
  PostReplyError = "post_reply_error",
}

export const SLACK_PROPERTY = "send_to_slack";

// Events that should be forwarded to Slack.
export const SEND_TO_SLACK: Record<AnalyticsEvent | ExceptionEvent, boolean> = {
  // Actions
  [AnalyticsEvent.ActionCompleted]: true,
  [AnalyticsEvent.FormStarted]: false,

  // Forms
  [AnalyticsEvent.FormPageViewed]: false,
  [AnalyticsEvent.FormPageExited]: false,
  [AnalyticsEvent.FormValidationError]: false,

  // Video
  [AnalyticsEvent.VideoSeen]: false,
  [AnalyticsEvent.VideoStarted]: false,
  [AnalyticsEvent.VideoProgress]: false,
  [AnalyticsEvent.VideoFullyWatched]: false,

  // Activities / forum
  [AnalyticsEvent.ActivityLiked]: true,
  [AnalyticsEvent.ForumCommentLiked]: true,

  // Notifications
  [AnalyticsEvent.NotificationClicked]: false,
  [AnalyticsEvent.NotificationReadViaClick]: false,
  [AnalyticsEvent.NotificationMarkedRead]: false,
  [AnalyticsEvent.NotificationsMarkedAllAsRead]: false,
  [AnalyticsEvent.NotifLinkClick]: false,

  // Signup / invites
  [AnalyticsEvent.InvitePageOpened]: false,
  [AnalyticsEvent.NewUser]: true,
  [AnalyticsEvent.SidLoad]: false,

  // Auth
  [AnalyticsEvent.AuthFailedToRefresh]: false,
  [AnalyticsEvent.Login]: true,
  [AnalyticsEvent.Logout]: true,

  // Visible actions (server-side)
  [AnalyticsEvent.ForumPostCreated]: true,
  [AnalyticsEvent.ForumCommentCreated]: true,
  [AnalyticsEvent.ForumPostLiked]: true,
  [AnalyticsEvent.ForumPostUnliked]: true,
  [AnalyticsEvent.ForumCommentUnliked]: true,
  [AnalyticsEvent.ActivityCommentCreated]: true,
  [AnalyticsEvent.ActivityUnliked]: true,
  [AnalyticsEvent.ActionOptedOut]: true,
  [AnalyticsEvent.ContractSigned]: true,
  [AnalyticsEvent.ContractSuspended]: true,
  [AnalyticsEvent.CommunityCreated]: true,
  [AnalyticsEvent.CommunityJoined]: true,
  [AnalyticsEvent.CommunityLeft]: true,
  [AnalyticsEvent.FriendRequestSent]: true,
  [AnalyticsEvent.FriendRequestAccepted]: true,
  [AnalyticsEvent.FriendRemoved]: true,
  [AnalyticsEvent.ConversationCreated]: true,
  [AnalyticsEvent.MessageSent]: true,

  // Email (Mailgun webhook)
  [AnalyticsEvent.EmailDelivered]: false,
  [AnalyticsEvent.EmailOpened]: false,
  [AnalyticsEvent.EmailClicked]: false,
  [AnalyticsEvent.EmailBounced]: false,
  [AnalyticsEvent.EmailComplained]: false,
  [AnalyticsEvent.EmailUnsubscribed]: false,

  // Server
  [AnalyticsEvent.DbSlowQuery]: false,

  // Exceptions
  [ExceptionEvent.FormSubmitError]: false,
  [ExceptionEvent.FollowUpFormSubmitError]: false,
  [ExceptionEvent.PostReplyError]: false,
};
