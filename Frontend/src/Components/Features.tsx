import reconnect from "../assets/technology-concept-with-futuristic-element.jpg";
import fairMatchMaking from "../assets/Gemini_Generated_Image_h6poc7h6poc7h6po.png"
import instantMatchmaking from "../assets/two-children-playing-chess-table-flat-vector-art-style_771357-13083.jpeg"
import { Card } from "./Card";

export function Features() {
  const features = [
  {
    title: "Instant Matchmaking ",
    icon:instantMatchmaking,
    subtitle: "Jump into a game instantly, whether as a guest or signed-in player.",
  },
  {
    title: "Fair & Competitive Play",
    icon:fairMatchMaking,
    subtitle: "Get matched with opponents at your skill level and track your progress with an ELO rating system.",
  },
  {
    title: "Seamless Reconnects ",
    icon:reconnect,
    subtitle: "Leave, refresh, or switch devices and return to your game without losing your position.",
  },
];


  return (
    <>
    <div className="container mx-auto px-6 md:pt-20 mt-20 md:mt-24 lg:mt-32 mb-10 md:mb-24 lg:mb-56 text-white">
      <ul>
        {features.map((f, i) => (
          <li
            key={i}
            className={`flex flex-col md:flex-row ${
              i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
            } justify-between items-center mb-16 md:mb-20`}
          >
            <div className="md:w-1/2 md:px-10">
            <Card title={f.title}
            subtitle={f.subtitle}
            key={i}
            className="py-12 px-12 text-center "
            />
            </div>

            <div className="mt-8 md:mt-0 md:w-1/2 md:px-10">
              <div className="w-full md:aspect-square   bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <img
                  src={f.icon}
                  alt={f.title}
                  loading="lazy"
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
        </>
  );
}
