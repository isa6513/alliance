import BaseLikeButton, { BaseLikeButtonProps } from "./BaseLikeButton";

const PostLikeButton: React.FC<BaseLikeButtonProps> = (props) => {
  return <BaseLikeButton {...props} border></BaseLikeButton>;
};

export default PostLikeButton;
