export function rollWaveSpawnDelay(baseInterval, spawnIndex, totalSpawns) {
  if (baseInterval <= 0) return 0.2;

  const progress = totalSpawns <= 1 ? 0.5 : spawnIndex / Math.max(1, totalSpawns - 1);
  const shape = 0.55 + Math.sin(progress * Math.PI) * 0.65;
  const jitter = 0.72 + Math.random() * 0.56;

  return Math.max(0.18, baseInterval * shape * jitter);
}
