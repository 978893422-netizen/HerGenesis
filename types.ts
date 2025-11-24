export enum SpeciesType {
  DODO = 'Dodo',
  MAMMOTH = 'Mammoth',
  THYLACINE = 'Thylacine',
  IRISH_ELK = 'Irish Elk'
}

export enum LifeStage {
  INFANT = 'Infant',
  ADULT = 'Adult',
  BREEDING = 'Breeding',
  MATRIARCH = 'Matriarch' // Re-breeding
}

export interface SpeciesData {
  id: SpeciesType;
  name: string;
  scientificName: string;
  extinctionYear: string;
  origin: string;
  description: string;
  story: string;
  imageUrl: string;
}

export interface PetStats {
  hunger: number; // Max 200
  intimacy: number; // Max 200
  health: number; // Max 200
}

export interface Pet {
  id: string;
  speciesId: SpeciesType;
  name: string;
  stage: LifeStage;
  stats: PetStats;
  birthDate: number;
  generation: number;
}

export interface UserState {
  walletAddress: string | null;
  balance: number; // Simulated ETH
  inventory: Pet[];
}

export interface GameState {
  globalPopulation: Record<SpeciesType, number>;
  populationHistory: { date: string; [key: string]: number | string }[];
}
