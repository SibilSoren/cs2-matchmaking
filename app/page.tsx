import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12 px-4 max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen">
      <h1 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
        CS2 Matchmaking
      </h1>

      <p className="text-lg text-center text-gray-300 max-w-2xl">
        Elevate your Counter-Strike 2 experience with our advanced matchmaking
        system.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        <FeatureCard
          title="Team Formation"
          description="Create and manage your CS2 teams effortlessly. Add players and designate captains in seconds."
          icon="👥"
        />
        <FeatureCard
          title="Map Veto System"
          description="Fair map selection process with our intuitive veto system. Choose your battleground strategically."
          icon="🗺️"
        />
        <FeatureCard
          title="Skill-Based Matching"
          description="Find worthy opponents with our advanced algorithm. Enjoy balanced and competitive matches every time."
          icon="🎯"
        />
        <FeatureCard
          title="Match Statistics"
          description="Analyze your performance with detailed post-match stats. Identify areas for improvement and track your progress."
          icon="📊"
        />
      </div>

      <Link href="/matchmaking">
        <Button
          size="lg"
          className="mt-6 px-8 py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Start Matchmaking
        </Button>
      </Link>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Card className="bg-gray-800 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
      <CardBody className="p-4">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-cyan-400">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </CardBody>
    </Card>
  );
}
