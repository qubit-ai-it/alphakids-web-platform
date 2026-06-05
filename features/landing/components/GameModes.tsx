import { gameModes, type GameMode } from '@/features/landing/data/content';
import { Icon } from '@/shared/components/ui/Icon';

function GameModeCard({ mode }: { mode: GameMode }) {
  const accentMap: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-700',
    accent: 'bg-amber-100 text-amber-600',
  };

  const iconBg = accentMap[mode.color] ?? accentMap.primary;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 text-center md:text-left">
      <div
        className={`w-[56px] h-[56px] rounded-[14px] flex items-center justify-center mx-auto md:mx-0 mb-[16px] ${iconBg}`}
      >
        <Icon name={mode.icon as any} size={28} />
      </div>
      <h3 className="text-[20px] font-bold text-secondary-900 mb-[8px]">{mode.title}</h3>
      <p className="text-[14px] text-secondary-600 leading-relaxed">{mode.description}</p>
    </div>
  );
}

export default function GameModes() {
  return (
    <section id="game-modes" className="py-[80px] md:py-[100px] bg-white">
      <div className="max-w-[1200px] mx-auto px-[24px]">
        <div className="text-center mb-[60px]">
          <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
            Tres modos de juego
          </h2>
          <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[600px] mx-auto">
            Cada modo usa una tecnología distinta para que el aprendizaje sea variado y divertido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {gameModes.map((mode) => (
            <GameModeCard key={mode.title} mode={mode} />
          ))}
        </div>
      </div>
    </section>
  );
}
