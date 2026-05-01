import React from "react";
import { Link, href } from "react-router";
import type { FeaturedImpactAction } from "../content/featuredImpactActions";
import { cn } from "@alliance/shared/styles/util";

const FeaturedImpactCard: React.FC<
  FeaturedImpactAction & { bgColor?: "grey" | "white" }
> = ({ actionId, emphasis, rest, bgColor = "grey" }) => {
  const cardStyle = bgColor === "grey" ? "bg-grey-0" : "bg-white";
  return (
    <Link
      to={href("/actions/:id", { id: actionId.toString() })}
      className={cn(
        "flex flex-col gap-4 group hover:border-grey-3 rounded-md p-4 sm:p-10",
        cardStyle,
      )}
    >
      <p className="text-lg text-zinc-500 lg:text-xl">
        <span className="font-semibold text-black group-hover:underline">
          {emphasis}
        </span>{" "}
        {rest}
      </p>
    </Link>
  );
};

export default FeaturedImpactCard;
