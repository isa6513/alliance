import { Link, useNavigate } from "react-router";

enum NavbarPage {
  People = "People",
  Guide = "Guide",
}

const links: NavbarPage[] = [NavbarPage.People, NavbarPage.Guide];

const destinations: Record<NavbarPage, string> = {
  [NavbarPage.People]: "/people",
  [NavbarPage.Guide]: "/guide",
};

interface PrelaunchNavbarProps {
  transparent?: boolean;
  absolute?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
}

const PrelaunchNavbar: React.FC<PrelaunchNavbarProps> = ({
  transparent = true,
  absolute = true,
  ref,
}: PrelaunchNavbarProps) => {
  const navigate = useNavigate();
  return (
    <div
      className={`
      flex flex-col sm:flex-row md:gap-y-4 ${absolute ? "absolute" : "relative"}
      w-screen justify-between items-center py-4 md:py-5 px-24 top-0 left-0 z-10 text-[14pt] transition-[padding,background-color] duration-300 ${
        transparent
          ? "bg-transparent text-white"
          : "bg-zinc-800 text-white border-b md:border-none border-zinc-200"
      }`}
      ref={ref}
    >
      <h1
        className="font-bold font-berlingske !text-[18pt] md:!text-[20pt] cursor-pointer text-nowrap"
        onClick={() => {
          navigate("/");
        }}
      >
        THE ALLIANCE
      </h1>
      <div className="flex flex-row items-center gap-x-10">
        {links.map((link) => (
          // link == NavbarPage.Guide ? (
          //   <Link to={destinations[link]} key={link}>
          //     <p
          //       className={`${
          //         transparent
          //           ? " hover:bg-white hover:text-black"
          //           : " hover:bg-white hover:text-black"
          //       } rounded-md py-1 px-4 whitespace-nowrap `}
          //     >
          //       {link}
          //     </p>
          //   </Link>
          // ) : (
          <Link to={destinations[link]} key={link}>
            <p className="hover:underline whitespace-nowrap">{link}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PrelaunchNavbar;
