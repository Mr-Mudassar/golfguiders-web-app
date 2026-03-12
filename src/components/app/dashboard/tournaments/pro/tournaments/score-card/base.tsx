interface BaseScoreCardProps {
  player: {
    id: string;
    name: string;
  };
  className?: string;
}

export const BaseScoreCard: React.FC<BaseScoreCardProps> = ({
  player,
  className,
}) => {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <h3 className="font-bold text-lg mb-4">{player.name}</h3>
    </div>
  );
};
