import BaseLikeButton, { BaseLikeButtonProps } from "./BaseLikeButton";

const CommentLikeButton: React.FC<BaseLikeButtonProps> = (props) => {
  return <BaseLikeButton {...props}></BaseLikeButton>;
};

export default CommentLikeButton;
