export function profileUrl(userId: number) {
  return `/user/${userId}`;
}

export function actionUrl(actionId: number, full = false) {
  const path = `/actions/${actionId}`;
  return full ? `${process.env.APP_URL}${path}` : path;
}

export function postUrl(postId: number) {
  return `/forum/post/${postId}`;
}

export function replyUrl(postId: number, replyId: number) {
  return `/forum/post/${postId}?replyId=${replyId}`;
}

export function activityReplyUrl(
  actionId: number,
  activityId: number,
  replyId: number,
) {
  return `/actions/${actionId}/activity/${activityId}?replyId=${replyId}`;
}
