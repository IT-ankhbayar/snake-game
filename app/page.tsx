import { SnakeGame } from "./components/SnakeGame";


export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <SnakeGame />

    </main>
  );
}