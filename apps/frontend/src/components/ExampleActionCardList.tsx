import React from "react";
import ExampleActionCard from "./ExampleActionCard";

const ExampleActionCardList: React.FC = () => {
  const exampleActions = [
    {
      name: "Participate in an experiment to measure awareness of AI data use practices",
      description:
        "Members were asked about their AI privacy preferences. The office will use the results to plan a follow-up awareness campaign in favor of opt-in, rather than opt-out, data use practices.",
      purpose:
        "We will learn if surfacing members' preferences can help us generate awareness of important issues.",
      imgSrc: "https://worldalliance.org/api/images/1765910145202.webp",
      imgAlt: "A survey flyer that a member displayed in their community",
    },
    {
      name: "Approve proposals for how to spend $1,000",
      description:
        "Members sent in and voted on proposals for how to spend $1,000 provided by a one-time donor. The $1,000 was ultimately split between Cool Earth and GiveDirectly.",
      purpose:
        "We tested a process for rapidly reaching agreement in a low-stakes setting. The resulting donations offset a year of CO2 emissions for all participating members and covered about 5 months of expenditure for a household living in extreme poverty.",
    },
    {
      name: "Report a pothole in your community",
      description:
        "Members found and reported a pothole to their local government, most of which were repaired within a week.",
      purpose:
        "Members learned about one way that local governments can respond quickly to citizen concerns. We reported 19 potholes and 1 broken wall in total.",
      imgSrc: "https://worldalliance.org/api/images/1765911493684.webp",
      imgAlt: "A pothole reported by a member",
    },
    {
      name: "Answer questions about nonprofit website copy and design",
      description:
        "Members provided feedback on the copy and design of three nonprofit websites. The office sent the results to the nonprofits to help them increase their donation conversion rates.",
      purpose:
        "The survey introduced members to some effective non-profits. Delivering the results to the non-profits showed that they respond positively to thoughtful feedback.",
    },
    {
      name: "Sign a letter requesting news coverage of a bring-your-own-cup cafe coalition",
      description: (
        <span>
          The office asked several cafes to adopt and advertise a
          bring-your-own-cup policy, promising that members would help them
          attain media coverage. After the cafes took action, members signed a
          letter to journalists requesting a feature. Finally, a journalist{" "}
          <a
            href="https://www.baristamagazine.com/washington-cafes-are-uniting-to-combat-disposable-cup-waste-and-they-want-you-to-join-them/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            wrote an article about the cafes
          </a>
          .
        </span>
      ),
      purpose:
        "We learned that offering to help businesses attain media coverage can encourage policy changes. The policy change itself will likely reduce a small amount of waste.",
      imgSrc: "https://worldalliance.org/api/images/1765912025673.webp",
      imgAlt: "A cafe team took this photo for the article",
    },
  ];

  return (
    <div className="flex flex-col rounded gap-y-6">
      {exampleActions.map((action) => (
        <ExampleActionCard
          key={action.name}
          name={action.name}
          description={action.description}
          purpose={action.purpose}
          imgSrc={action.imgSrc}
          imgAlt={action.imgAlt}
        />
      ))}
    </div>
  );
};

export default ExampleActionCardList;
