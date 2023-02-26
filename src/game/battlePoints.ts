export const lostActionPointsForScorpion: { [attackType: string]: number } = {
  step: 1,
  punch: 3,
}

export const damageFromGhoul: { [attackType: string]: number } = {
  punch: 2,
}

export const damageFromScorpion: { [attackType: string]: number } = {
  punch: 3,
}

export const damageFromDeathClaw: { [attackType: string]: number } = {
  punch: 5,
}

export const lostActionPointsForHero: { [attackType: string]: number } = {
  step: 1,
  fists: 3,
  pistol: 4,
}

export const damageFromHero: { [attackType: string]: number } = {
  fists: 3,
  pistol: 10,
}

export const entitiesTotalActionPoints: { [attackType: string]: number } = {
  hero: 10,
  scorpion: 5,
  deathClaw: 8,
  ghoul: 5,
};
