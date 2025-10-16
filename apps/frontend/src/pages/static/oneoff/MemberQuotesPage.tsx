import React from "react";
import MemberQuoteCard from "../../../components/MemberQuoteCard";

const MemberQuotesPage: React.FC = () => {
  // Using this page to showcase member quotes, all + anonymous for members, and selected + some named for supporters

  const forExternalSharing = false;

  const memberQuotes = [
    {
      quote:
        "Giving back is good. But giving back through the Alliance's highly optimized model is good, and smart. I'm excited to see my invested effort go such a long way.",
      author: "Anonymous",
    },

    {
      quote:
        "I was so pleased to witness the birth of the Alliance, especially because it was initiated by two young adults in their 20s. Our world is facing tremendous challenges, but the governments are failing to reach a consensus for meaningful and effective solutions. Now the young generation is facing the challenges head-on themselves. I am confident that the Alliance will attract many followers and become a significant force in guiding humanity toward a sustainable future.",
      author: "Bryan Xu",
    },
    {
      quote:
        "I believe strongly in the importance of collective actions to push back against the challenges facing us today, especially around inequality and environmental degradation. No one can tackle these crises alone. I am concerned about the future of the planet for the children I hope to raise, and I believe that now is the time to take action like this to hopefully 'save the world.'",
      author: "Anonymous",
    },
    {
      quote:
        "On the whole, world is not going in the right direction. We need new ideas to change that, and The Alliance is just that. But it will work only if we all participate.",
      author: "Janos Pasztor",
    },
    {
      quote:
        "There is overwhelming precedent for collective action resulting in societal improvement for those who are organized. Historically, collective action has been confined by geographic location, political ideology, or socioeconomic status—achieving impressive but stratified results. A decentralized organization that focuses on problems which concern all people and holds its members to account is an opportunity to achieve truly widespread human flourishing. There are countless reasons to doubt its potential for success, but unlikelier movements and worse circumstances have reliably bore fruit. We have to try, to become vessels for our nobler ideals and hopes for the world.",
      author: "Sam Spinner",
    },
    {
      quote:
        "Seeing some actions start to be completed by other members has really given me confidence in the viability of the Alliance to coordinate behavior. I'm looking forward to seeing what happens!",
      author: "Casey Manning",
    },
    {
      quote:
        "I'm very worried about the proliferation of crises + the observed inability of current institutions to step up and handle them. I'm excited about the Alliance because it might be able to grow into such an institution, and at the very least might do a lot of good along the way.",
      author: "Mark Xu",
    },
    {
      quote:
        "I think the Alliance is a much-needed platform for encouraging positive community building and incremental change for solving the biggest problems facing the world today.",
      author: "Anonymous",
    },
    {
      quote:
        "Given the world's concerning trajectory and the lack of Internet-enabled collaboration, the Alliance has the opportunity to enact huge positive change.",
      author: "Grant Hough",
    },
    {
      quote:
        "We need bold ideas to overcome the global tragedies of the commons, and I'm excited to see the Alliance take action to address these challenges and collective action problems.",
      author: "Akash Borde",
    },
    {
      quote:
        "I’m excited to join the Alliance in trying to pick some of the low hanging fruit in coordination tech; we’re still mostly using 19th century institutions for 21st century problems. There has been very little practical exploration of the coordination space, and we’re going to need even better coordination for the challenges to come.",
      author: "Kyle Scott",
    },
    {
      quote:
        "I am extremely concerned about the sustainability of our planet and life as we know it on earth. I am hoping that the Alliance will help to gently and effectively nudge us in a better direction!",
      author: "Keller Strother",
    },
    {
      quote:
        "I want to Walk in Love and believe the Alliance cares about this.",
      author: "Anonymous",
    },

    {
      quote:
        "People often feel disempowered yet yearn for their values and efforts to be realized in a concrete manner. Participation in the Alliance allows members to concretely influence, track, and see results of their own and community efforts.",
      author: "Bob Grand",
    },
    {
      quote:
        "In the past we’ve made progress, as a society, solving certain environmental problems, but I worry about the problem of climate change. Its impacts are so variable and unpredictable that it’s harder to “sell” the need for solutions. I hope the Alliance can be a source of ideas for attacking the problem, as well as a wellspring of positivity, teamwork and persistence.",
      author: "Katherine Elwood Hashimoto",
    },
    {
      quote:
        "I like the purpose of Alliance which created to improve our world, to make a better living environment for all.",
      author: "Anonymous",
    },
    {
      quote:
        "I often worry about the future, and the Alliance provides a platform where I can address these fears by taking direct actions for meaningful change.",
      author: "Anonymous",
    },
    {
      quote:
        "I am very excited about the Alliance. I beleive that we can make a difference by working towards common goals.",
      author: "Anonymous",
    },

    {
      quote:
        "It seems to me that there is an inability to leverage collective will towards problems that almost everybody agrees exist (severe wealth inequality; climate change; political polarization to name a few). I think this is mostly a function of not individuals not having clear actions that can affect the relevant issue. Alliance is the natural solution to this, empowering communities to take back control.",
      author: "Connor Cremers",
    },
    {
      quote:
        "Looking because my friend Mark invited me to join and them mission is noble! Looking forward to 1000 users.",
      author: "James Valencia",
    },
    {
      quote:
        "I am concerned that problems are starting to get too large to handle. I believe Alliance has the potential garner enough members to collectively tackle these problems.",
      author: "David Kim",
    },
    {
      quote:
        "I excited about the potential of the Alliance. I believe we can work together in a coordinated way to make the world better.",
      author: "Anonymous",
    },
    {
      quote:
        "Humanity faces enormous conflict and tragedy. Collective action organized over the Internet is one of the most promising and least tested solutions.",
      author: "Sidney Hough",
    },
    {
      quote:
        "I'm excited about the possibility of making changes in my community and the world. Working together with like-minded individuals to foster change is gratifying.",
      author: "Danny Leung",
    },
    {
      quote:
        "I am excited to support the Alliance & what it stands for. Small actions can compound into large impact, and I'm hoping this is a step in the right direction for all of us!",
      author: "Anonymous",
    },
    {
      quote: "Collective action is important and just got easier!",
      author: "Anonymous",
    },
    {
      quote:
        "I'm worried about how distant many communities feel to me, even (or perhaps especially) those in the same country that I grew up in. I like learning new languages and have made friends with some very different people this way, so I know that it's less a problem of actual cultural difference and more a lack of opportunity to interact with and work with these people, at least for me. Many tangible problems like climate change, and even more abstract problems like what international politics should look like, will require group discussion and group action. I'm excited about the Alliance because it seeks to bring together people with different mindsets and priorities to improve the world we all live in.",
      author: "Anonymous",
    },
    {
      quote:
        "I’m excited to see where the Alliance goes. It’s great to see so many people interested in joining a platform targeted towards social good.",
      author: "Liam Rosenfeld",
    },
    {
      quote: "I’m excited about collective action!",
      author: "shawn mcginn",
    },
    {
      quote:
        "I’m curious about the potential of collective action and would like to explore that through the Alliance.",
      author: "Anonymous",
    },
    {
      quote:
        "The Alliance brings together people who actually care about working together to build a better future for everyone.",
      author: "Dulce Celeste Martinez",
    },
    {
      quote:
        "I care about social mobility and gender equity in the world. I hope Alliance can create some positive impact on local community.",
      author: "Anonymous",
    },
  ];

  const selectedQuotes = [
    {
      quote:
        "Giving back is good. But giving back through the Alliance's highly optimized model is good, and smart. I'm excited to see my invested effort go such a long way.",
      author: "Anonymous",
    },
    {
      quote:
        "I was so pleased to witness the birth of the Alliance, especially because it was initiated by two young adults in their 20s. Our world is facing tremendous challenges, but the governments are failing to reach a consensus for meaningful and effective solutions. Now the young generation is facing the challenges head-on themselves. I am confident that the Alliance will attract many followers and become a significant force in guiding humanity toward a sustainable future.",
      author: "Bryan Xu",
    },
    {
      quote:
        "I believe strongly in the importance of collective actions to push back against the challenges facing us today, especially around inequality and environmental degradation. No one can tackle these crises alone. I am concerned about the future of the planet for the children I hope to raise, and I believe that now is the time to take action like this to hopefully 'save the world.'",
      author: "Anonymous",
    },
    {
      quote:
        "On the whole, world is not going in the right direction. We need new ideas to change that, and The Alliance is just that. But it will work only if we all participate.",
      author: "Janos Pasztor",
    },
    {
      quote:
        "There is overwhelming precedent for collective action resulting in societal improvement for those who are organized. Historically, collective action has been confined by geographic location, political ideology, or socioeconomic status—achieving impressive but stratified results. A decentralized organization that focuses on problems which concern all people and holds its members to account is an opportunity to achieve truly widespread human flourishing. There are countless reasons to doubt its potential for success, but unlikelier movements and worse circumstances have reliably bore fruit. We have to try, to become vessels for our nobler ideals and hopes for the world.",
      author: "Sam Spinner",
    },
    {
      quote:
        "It seems to me that there is an inability to leverage collective will towards problems that almost everybody agrees exist (severe wealth inequality; climate change; political polarization to name a few). I think this is mostly a function of not individuals not having clear actions that can affect the relevant issue. The Alliance is the natural solution to this, empowering communities to take back control.",
      author: "Connor Cremers",
    },
    {
      quote:
        "Seeing some actions start to be completed by other members has really given me confidence in the viability of the Alliance to coordinate behavior. I'm looking forward to seeing what happens!",
      author: "Anonymous",
    },
    {
      quote:
        "I want to Walk in Love and believe the Alliance cares about this.",
      author: "Anonymous",
    },
    {
      quote:
        "We need bold ideas to overcome the global tragedies of the commons, and I'm excited to see the Alliance take action to address these challenges and collective action problems.",
      author: "Akash Borde",
    },
    {
      quote:
        "I’m excited to join the Alliance in trying to pick some of the low hanging fruit in coordination tech; we’re still mostly using 19th century institutions for 21st century problems. There has been very little practical exploration of the coordination space, and we’re going to need even better coordination for the challenges to come.",
      author: "Kyle Scott",
    },
    {
      quote:
        "I am extremely concerned about the sustainability of our planet and life as we know it on earth. I am hoping that the Alliance will help to gently and effectively nudge us in a better direction!",
      author: "Keller Strother",
    },
    {
      quote:
        "People often feel disempowered yet yearn for their values and efforts to be realized in a concrete manner. Participation in the Alliance allows members to concretely influence, track, and see results of their own and community efforts.",
      author: "Bob Grand",
    },
    {
      quote:
        "In the past we’ve made progress, as a society, solving certain environmental problems, but I worry about the problem of climate change. Its impacts are so variable and unpredictable that it’s harder to “sell” the need for solutions. I hope the Alliance can be a source of ideas for attacking the problem, as well as a wellspring of positivity, teamwork and persistence.",
      author: "Katherine Elwood Hashimoto",
    },
    {
      quote:
        "I am concerned that problems are starting to get too large to handle. I believe Alliance has the potential garner enough members to collectively tackle these problems.",
      author: "David Kim",
    },
    {
      quote:
        "I'm worried about how distant many communities feel to me, even (or perhaps especially) those in the same country that I grew up in. I like learning new languages and have made friends with some very different people this way, so I know that it's less a problem of actual cultural difference and more a lack of opportunity to interact with and work with these people, at least for me. Many tangible problems like climate change, and even more abstract problems like what international politics should look like, will require group discussion and group action. I'm excited about the Alliance because it seeks to bring together people with different mindsets and priorities to improve the world we all live in.",
      author: "Anonymous",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <div className="flex flex-col flex-grow items-center justify-center ">
        <div className="w-full max-w-4xl px-4 md:px-8 py-12 md:py-24">
          {forExternalSharing ? (
            <h2 className="uppercase font-serif !text-4xl text-center mb-10 mx-4">
              Selected quotes
            </h2>
          ) : (
            <>
              <h2 className="font-serif !text-4xl text-center mb-2 mx-4">
                Quotes from members
              </h2>
              <p className="text-center text-lg text-zinc-500 mb-10">
                October 16, 2025
              </p>
            </>
          )}

          <div className="flex flex-col gap-2">
            {forExternalSharing
              ? selectedQuotes.map((memberQuote, index) => (
                  <MemberQuoteCard
                    key={index}
                    quote={memberQuote.quote}
                    author={memberQuote.author}
                    showAuthor={true}
                  />
                ))
              : memberQuotes.map((memberQuote, index) => (
                  <MemberQuoteCard
                    key={index}
                    quote={memberQuote.quote}
                    author={memberQuote.author}
                    showAuthor={false}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberQuotesPage;
