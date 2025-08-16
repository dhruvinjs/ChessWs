import { Navbar } from "../Components";

export function About() {
  return (
    <>
      <div className="flex flex-col text-black min-h-screen bg-[#EFEBE9]">
        <Navbar />

        {/* Project Section */}
        <div className="flex flex-col justify-center px-6 text-center">
          <h1 className="text-4xl mt-10 xl:text-6xl font-bold">
            About Project and Dev Behind it
          </h1>

          <div className="max-w-2xl m-10 mx-auto leading-relaxed text-xl">
            <p>
              This is a simple multiplayer chess game built with{" "}
              <span className="font-semibold">React</span> on the frontend and{" "}
              <span className="font-semibold">Node.js</span> on the backend.
            </p>
            <p className="mt-6">
              It uses <span className="font-semibold">Redis</span> for queue
              management (matchmaking players) and for caching active games to
              ensure fast performance and smooth reconnections.
            </p>
            <p className="mt-6">
              The goal of this project is to explore how modern web
              technologies—WebSockets, Redis, and real-time state
              management—can be combined to create an engaging and scalable
              online game experience.
            </p>
          </div>
        </div>

        {/* Developer Section */}
        <div className="max-w-2xl mx-auto leading-relaxed border-t border-gray-300 pt-12 text-center">
          {/* Optional Avatar */}
          {/* <img 
            src="/your-profile.jpg" 
            alt="Developer" 
            className="w-32 h-32 rounded-full mx-auto mb-6 shadow-md" 
          /> */}

          <h2 className="text-4xl font-semibold mb-6">About the Developer</h2>
          <p className="text-xl">
            Hi, I’m <span className="font-semibold">Dhruvin Soni</span>, a
            passionate developer exploring full-stack web development and system
            design. My interests lie in building real-time applications, working
            with databases, and understanding the internals of modern web
            technologies.
          </p>
          <p className="mt-6 text-xl">
            This project was a way for me to dive deeper into concepts like
            WebSockets, Redis, and scalable backend design while keeping the
            experience fun through a multiplayer chess game. It also helped me
            understand how <span className="font-semibold">Prisma ORM</span> can
            be used with different databases—here I’m using{" "}
            <span className="font-semibold">PostgreSQL</span> as the primary
            database.
          </p>
        </div>
      </div>
    </>
  );
}
