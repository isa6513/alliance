# Controller Return-Type DTO Audit

Rules:

1. Has a constructor
2. No `OmitType` — use `PickType`
3. No `Object.assign` in constructor — assign each field manually
4. Every controller method returning this DTO must `new` it (not return a plain object/entity/service result)

Only DTOs with at least one violation are listed.

## analytics/analytics.controller.ts

### `TimeSpentForUserDto` — `server/src/analytics/timespent.dto.ts:3`

- [x] Rule 1: no constructor
- [x] Rule 4:
  - [x] `analytics.controller.ts:31` — `getTimeSpentPerUser`
  - [x] `analytics.controller.ts:38` — `getTimeSpentPerUserTotal`

### `DailyStatsDto` — `server/src/analytics/dailystats.dto.ts:4`

- [x] Rule 1: no constructor
- [x] Rule 2: `extends OmitType(DailyStatsRecord, [] as const)` at `dailystats.dto.ts:4`
- [x] Rule 4: `analytics.controller.ts:48` — `getDailyStats`

### `ActionStatsWithOnboardingDto` — `server/src/analytics/actionstats-with-onboarding.dto.ts:4`

- [x] Rule 1: no constructor
- [x] Rule 2: `extends OmitType(ActionStatsRecord, [] as const)` at `actionstats-with-onboarding.dto.ts:4`
- [x] Rule 4:
  - [x] `analytics.controller.ts:55` — `getActionStats`
  - [x] `analytics.controller.ts:64` — `getActionStatsById`
  - [x] `analytics.controller.ts:78` — `recalculateActionStats`

### `MemberCompletionRetentionCohortDto` — `server/src/analytics/member-completion-retention.dto.ts:46`

- [x] Rule 1: no constructor
- [x] Rule 4: `analytics.controller.ts:87` — `getMemberCompletionRetention`

### `ActionCompletionCurveDto` — `server/src/analytics/action-completion-curve.dto.ts:4`

- [x] Rule 1: no constructor
- [x] Rule 4: `analytics.controller.ts:101` — `getActionCompletionCurves`

### `TimeToChurnSampleDto` — `server/src/analytics/time-to-churn.dto.ts:3`

- [x] Rule 1: no constructor
- [x] Rule 4: `analytics.controller.ts:111` — `getTimeToChurnSamples`

### `AggregateStatsDto` — `server/src/analytics/aggregatestats.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `analytics.controller.ts:118` — `getAggregateStats`

### `InviteFunnelDto` — `server/src/analytics/invite-funnel.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `analytics.controller.ts:130` — `getInviteFunnel`

### `ContractStatusPointDto` — `server/src/analytics/contract-status-history.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `analytics.controller.ts:140` — `getContractStatusHistory`

---

## app.controller.ts

### `HealthCheckDto` — `server/src/app.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `app.controller.ts:16` — `healthCheck` returns object literal `{ status: 'OK' }`

---

## auth/auth.controller.ts

### `SignInResponseDto` — `server/src/auth/dto/signin.dto.ts:35`

- [ ] Rule 1: no constructor
- [ ] Rule 4:
  - [ ] `auth.controller.ts:73,75` — `login`
  - [ ] `auth.controller.ts:94,96` — `adminLogin`
  - [ ] `auth.controller.ts:135,137` — `register`

### `RefreshTokensResponseDto` — `server/src/auth/dto/authtokens.dto.ts:4`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `auth.controller.ts:161,163` — `refreshTokens`

### `AuthMeResponseDto` — `server/src/auth/dto/authtokens.dto.ts:17`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `auth.controller.ts:172` — `me`

---

## community/community.controller.ts

### `CommunityDto` — `server/src/community/dto/community.dto.ts:8`

- [ ] Rule 2: `extends OmitType(Community, [...])` at `community.dto.ts:8`
- [ ] Rule 3: `Object.assign(this, community)` at `community.dto.ts:25`

### `CommunityInviteDto` — `server/src/user/dto/invite.dto.ts:42`

- [ ] Rule 3: `Object.assign(this, communityInvite)` at `invite.dto.ts:57`

### `CommunityMemberContactInfoDto` — `server/src/user/dto/user-action-relations.dto.ts:99`

- [ ] Rule 4:
  - [ ] `community.controller.ts:229` — `getMemberContactInfo`
  - [ ] `community.controller.ts:241` — `getMemberContactInfoAdmin`
  - [ ] `community.controller.ts:250` — `getAllMemberContactInfoAdmin`

---

## contract/contract.controller.ts

### `ContractDto` — `server/src/contract/dto/contract.dto.ts:6`

- [ ] Rule 3: `Object.assign(this, {...})` at `contract.dto.ts:9`

### `ContractAdminDto` — `server/src/contract/dto/contract.dto.ts:28`

- [ ] Rule 3: `Object.assign(this, {...})` at `contract.dto.ts:38`

### `ContractEventDateDto` — `server/src/contract/dto/contract.dto.ts:23`

- [ ] Rule 1: no constructor
- [ ] Rule 4:
  - [ ] `contract.controller.ts:77` — `signContract` returns object literal `{ date }`
  - [ ] `contract.controller.ts:87` — `suspendContract` returns object literal `{ date }`

---

## eventlog/eventlog.controller.ts

### `EventLogListDto` — `server/src/eventlog/dto/event-log.dto.ts:19`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `eventlog.controller.ts:26` — `findAll`

### `EventLogDto` — `server/src/eventlog/dto/event-log.dto.ts:14`

- [ ] Rule 1: no constructor
- [ ] Rule 2: `extends OmitType(EventLog, ['user'])` at `event-log.dto.ts:14`
- [ ] Rule 4: `eventlog.controller.ts:37` — `findOne`

---

## forum/forum.controller.ts

### `PostDto` — `server/src/forum/dto/post.dto.ts:20`

- [ ] Rule 3: `Object.assign(this, post)` at `post.dto.ts:69`
- [ ] Rule 4:
  - [ ] `forum.controller.ts:57` — `findAllPosts`
  - [ ] `forum.controller.ts:80` — `findOnePost`

### `CommentDto` — `server/src/forum/dto/comment.dto.ts:16`

- [ ] Rule 3: `Object.assign(this, comment)` at `comment.dto.ts:40`
- [ ] Rule 4: `forum.controller.ts:176` — `createComment`

### `UserCommentDto` — `server/src/forum/dto/comment.dto.ts:50`

- [ ] (Inherits Rule 3 via parent `CommentDto` ctor — fixing parent fixes this)
- [ ] Rule 4: `forum.controller.ts:131` — `findCommentsByUser`

---

## geo/geo.controller.ts

### `CitySearchDto` — `server/src/geo/city.dto.ts:22`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `geo.controller.ts:21` — `searchCity`

---

## images/images.controller.ts

### `DeleteImageResponseDto` — `server/src/images/dto/image.dto.ts:18`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `images.controller.ts:99` — `deleteImage` returns object literal `{ deleted: true }`

### `UploadImageResponseDto` — `server/src/images/dto/image.dto.ts:23`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `images.controller.ts:108` — `uploadImage` returns object literal `{ url, key }`

---

## messaging/conversation.controller.ts

### `ConversationDto` — `server/src/messaging/dto/messaging.dto.ts:101`

- [ ] Rule 2: `extends OmitType(Conversation, [...])` at `messaging.dto.ts:101`
- [ ] Rule 3: `Object.assign(this, conversation)` at `messaging.dto.ts:136`
- [ ] Rule 4:
  - [ ] `conversation.controller.ts:47` — `getMyConversations`
  - [ ] `conversation.controller.ts:57` — `getCommunityConversations`
  - [ ] `conversation.controller.ts:70` — `createDirectConversation`
  - [ ] `conversation.controller.ts:80` — `createGroupConversation`
  - [ ] `conversation.controller.ts:94` — `updateInfo`
  - [ ] `conversation.controller.ts:110` — `acceptInvite`
  - [ ] `conversation.controller.ts:122` — `declineInvite`
  - [ ] `conversation.controller.ts:135` — `addParticipant`
  - [ ] `conversation.controller.ts:150` — `removeParticipant`
  - [ ] `conversation.controller.ts:164` — `markRead`
  - [ ] `conversation.controller.ts:195` — `leave`

### `ConversationAdminSummaryDto` — `server/src/messaging/dto/messaging.dto.ts:222`

- [ ] (Inherits Rule 2/3 via parent — fixing parent fixes these)
- [ ] Rule 4: `conversation.controller.ts:38` — `getAllConversationsForAdmin`

### `UnreadMessagesDto` — `server/src/messaging/dto/messaging.dto.ts:330`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `conversation.controller.ts:176` — `getUnreadMessages`

### `UnreadMessageSummaryDto` — `server/src/messaging/dto/messaging.dto.ts:336`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `conversation.controller.ts:185` — `getUnreadSummary`

---

## messaging/message.controller.ts

### `MessageDto` — `server/src/messaging/dto/messaging.dto.ts:46`

- [ ] Rule 2: `extends OmitType(Message, [...])` at `messaging.dto.ts:46`
- [ ] Rule 3: `Object.assign(this, message)` at `messaging.dto.ts:65`
- [ ] Rule 4:
  - [ ] `message.controller.ts:40` — `getConversationMessagesForAdmin`
  - [ ] `message.controller.ts:54` — `sendMessage`
  - [ ] `message.controller.ts:66` — `getMessages`

---

## notifs/notifs.controller.ts

### `NotificationDto` — `server/src/notifs/dto/notification.dto.ts:17`

- [ ] Rule 3: `Object.assign(this, notification)` at `notification.dto.ts:77`
- [ ] Rule 4: `notifs.controller.ts:38` — `findAll`

### `UnreadCountDto` — `server/src/notifs/dto/unread-count.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `notifs.controller.ts:45` — `getUnreadCount`

### `NotifClickResponseDto` — `server/src/notifs/dto/notifclick.dto.ts:9`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `notifs.controller.ts:90` — `linkClick`

---

## payments/payments.controller.ts

### `ClientSecretDto` — `server/src/payments/dto/client-secret.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `payments.controller.ts:100` — `createPaymentIntent` returns object literal

### `PaymentMethodDto` — `server/src/payments/dto/payment-method.dto.ts:3`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `payments.controller.ts:171` — `paymentMethod` returns object literal spread

---

## search/search.controller.ts

### `SearchItemDto` — `server/src/search/searchitem.dto.ts:14`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `search.controller.ts:27` — `all`

---

## tasks/tasks.controller.ts

### `FormResponseDto` — `server/src/tasks/form.dto.ts:119`

- [ ] Rule 4: `tasks.controller.ts:143` — `getFormResponses` (other returns are clean)

### `FormDto` — `server/src/tasks/form.dto.ts:93`

- [ ] Rule 4: `tasks.controller.ts:134` — `listForms`

### `FormSnapshotMigrationDto` — `server/src/tasks/form.dto.ts:230`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:152` — `getResponseSnapshotMigration`

### `MigrateResponseSnapshotsResultDto` — `server/src/tasks/form.dto.ts:259`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:162` — `migrateResponseSnapshots`

### `FormAggregateViewsDto` — `server/src/tasks/form.dto.ts:114`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:225` — `getFormAggregateViews`

### `CustomValidatorTypeDto` — `server/src/tasks/customvalidator.dto.ts:10`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:249` — `customValidators`

### `CustomValidatorResponseDto` — `server/src/tasks/customvalidator.dto.ts:50`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:260` — `runValidator`

### `CustomValidatorDto` — `server/src/tasks/customvalidator.dto.ts:42`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:269` — `findOneCustomValidator`

### `CreateCustomValidatorResponseDto` — `server/src/tasks/customvalidator.dto.ts:44`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:283` — `createCustomValidator`

### `TestCustomExpressionResponseDto` — `server/src/tasks/customvalidator.dto.ts:83`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `tasks.controller.ts:292` — `testCustomExpression`

### `ActionActivityDto` (already listed above under actions controller)

- [x] Rule 4: `tasks.controller.ts:306` — `optout`

---

## user/user.controller.ts

### `ProfileDto` — `server/src/user/dto/user.dto.ts:27`

- [ ] Rule 4:
  - [ ] `user.controller.ts:226` — `listReceivedRequests`
  - [ ] `user.controller.ts:234` — `listSentRequests`
  - [ ] `user.controller.ts:282` — `listFriends`
  - [ ] `user.controller.ts:294` — `listMessageableUsers`

### `UserAwayRangeDto` — `server/src/user/dto/away-range.dto.ts:36`

- [ ] Rule 3: `Object.assign(this, {...})` at `away-range.dto.ts:46`

### `MaybeUserLocationDto` — `server/src/geo/city.dto.ts:30`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `user.controller.ts:164` — `myLocation` returns object literal `{ city }`

### `FriendStatusDto` — `server/src/user/dto/user.dto.ts:20`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `user.controller.ts:248` — `myFriendRelationship`

### `PrefillUserDto` — `server/src/user/prefill-user.dto.ts:4`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `user.controller.ts:263` — `prefill` returns object literal

### `UserCityCountDto` — `server/src/user/dto/user.dto.ts:247`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `user.controller.ts:324` — `cityCounts`

### `SignupSocialProofDto` — `server/src/user/dto/user.dto.ts:101`

- [ ] Rule 4: `user.controller.ts:492` — `signupSocialProof`

### `OnetimeInviteDto` — `server/src/user/dto/invite.dto.ts:67`

- [ ] Rule 3: `Object.assign(this, onetimeInvite)` at `invite.dto.ts:88`

### `TagDto` — `server/src/user/dto/tag.dto.ts:7`

- [ ] Rule 2: `extends OmitType(Tag, ['users'])` at `tag.dto.ts:7`
- [ ] Rule 3: `Object.assign(this, tag)` at `tag.dto.ts:15`

### `UserDeviceDto` — `server/src/user/dto/device.dto.ts:28`

- [ ] Rule 1: no constructor
- [ ] Rule 4:
  - [ ] `user.controller.ts:668` — `registerDevice` returns object literal `{ id: device.id }`
  - [ ] `user.controller.ts:689` — `registerLiveActivityPushToStartToken`

---

## videos/videos.controller.ts

### `UploadVideoResponseDto` — `server/src/videos/dto/video-response.dto.ts:4`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `videos.controller.ts:64` — `uploadVideo` returns object literal `{ id, key, status }`

### `VideoListResponseDto` — `server/src/videos/dto/video-response.dto.ts:38`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `videos.controller.ts:72` — `listVideos` returns object literal `{ videos }`

### `VideoStatusResponseDto` — `server/src/videos/dto/video-response.dto.ts:10`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `videos.controller.ts:96` — `getVideoStatus` returns object literal

### `VideoDetailResponseDto` — `server/src/videos/dto/video-response.dto.ts:83`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `videos.controller.ts:115` — `getVideoDetails` returns object literal

### `ReplaceVideoResponseDto` — `server/src/videos/dto/video-response.dto.ts:108`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `videos.controller.ts:153` — `replaceVideo` returns object literal `{ id, key, status }`

### `DeleteVideoResponseDto` — `server/src/videos/dto/video-response.dto.ts:17`

- [ ] Rule 1: no constructor
- [ ] Rule 4: `videos.controller.ts:218` — `deleteVideo` returns object literal `{ deleted: true }`

---

## Clean (no violations found)

- `mail/mailgun.webhook.controller.ts` — only `void` returns
- `mms/mms.controller.ts` — returns primitive `string` (TwiML)
- `push/push.controller.ts` — only `void` returns
- `UserDto` (`server/src/user/dto/user.dto.ts:110`) — clean on all 4 rules
- `PushDto` (`server/src/push/dto/push.dto.ts:4`) — clean on all 4 rules

---

## Summary

- Controllers audited: 22
- Distinct DTOs flagged: ~80
- Most common: Rule 4 (controller doesn't `new` the DTO) — affects nearly every multi-method controller
- Rule 1 (missing constructor): ~50 DTOs
- Rule 3 (`Object.assign` in ctor): ~20 DTOs
- Rule 2 (`OmitType`): ~15 DTOs
