const CheckIcon = ({ size = "small" }: { size?: "small" | "large" }) => {
  const sizeClass = {
    small: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <svg
      viewBox="0 0 88 88"
      className={`${sizeClass[size]}`}
      fill="rgb(108, 174, 61)"
      aria-label="Done"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M36.9 62.4001L20 45.4001L25.6 39.8001L36.9 51.1001L62.4 25.6001L68 31.3001L36.9 62.4001Z" />
      <path d="M44 88C19.7 88 0 68.3 0 44C0 19.7 19.7 0 44 0C68.3 0 88 19.7 88 44C88 68.3 68.3 88 44 88ZM44 8C24.1 8 8 24.1 8 44C8 63.9 24.1 80 44 80C63.9 80 80 63.9 80 44C80 24.1 63.9 8 44 8Z" />
    </svg>
  );
};

export default CheckIcon;
