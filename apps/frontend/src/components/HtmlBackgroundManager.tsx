export function HtmlBackgroundManager({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export const useWhiteBackground = () => {
  const html = document.documentElement;
  html.classList.add("white");
};

export const useGrayBackground = () => {
  const html = document.documentElement;
  html.classList.remove("white");
};
