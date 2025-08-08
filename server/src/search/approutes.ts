export function profileUrl(userId: number) {
  return `/user/${userId}`;
}

export function actionUrl(actionId: number) {
  return `/actions/${actionId}`;
}

export function postUrl(postId: number) {
  return `/forum/post/${postId}`;
}

export function replyUrl(postId: number, replyId: number) {
  return `/forum/post/${postId}?replyId=${replyId}`;
}
