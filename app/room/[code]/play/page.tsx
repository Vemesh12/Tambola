import { PlayerGameClient } from "@/components/PlayerGameClient";

type PlayerGamePageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function PlayerGamePage({ params }: PlayerGamePageProps) {
  const { code } = await params;

  return <PlayerGameClient code={code.toUpperCase()} />;
}
