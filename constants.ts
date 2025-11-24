import { SpeciesType, SpeciesData, LifeStage } from './types';

export const SPECIES_DB: Record<SpeciesType, SpeciesData> = {
  [SpeciesType.DODO]: {
    id: SpeciesType.DODO,
    name: "Dodo",
    scientificName: "Raphus cucullatus",
    extinctionYear: "1662",
    origin: "Mauritius",
    description: "A gentle, flightless bird that lived in peace until forgotten.",
    story: "The Dodo represents the innocence of an isolated paradise. Her return signifies a second chance for trust. In HerGenesis, she is the nurturer of the coast.",
    imageUrl: "https://picsum.photos/id/1062/600/600" // Dog as placeholder for pet
  },
  [SpeciesType.MAMMOTH]: {
    id: SpeciesType.MAMMOTH,
    name: "Woolly Mammoth",
    scientificName: "Mammuthus primigenius",
    extinctionYear: "2000 BC",
    origin: "Arctic Tundra",
    description: "The matriarch of the ice, guiding her herd through the eternal winter.",
    story: "Carrying the wisdom of the frozen earth, the Mammoth brings resilience. Her thick fur weaves the history of a world before man.",
    imageUrl: "https://picsum.photos/id/1003/600/600" // Deer/Animal placeholder
  },
  [SpeciesType.THYLACINE]: {
    id: SpeciesType.THYLACINE,
    name: "Thylacine",
    scientificName: "Thylacinus cynocephalus",
    extinctionYear: "1936",
    origin: "Tasmania",
    description: "The striped ghost of the bush, a shy and misunderstood hunter.",
    story: "Benjamin was the last male, but here we revive the females. The Thylacine teaches us the value of silence and observation in the digital wild.",
    imageUrl: "https://picsum.photos/id/1025/600/600" // Pug/Dog placeholder
  },
  [SpeciesType.IRISH_ELK]: {
    id: SpeciesType.IRISH_ELK,
    name: "Irish Elk",
    scientificName: "Megaloceros giganteus",
    extinctionYear: "5000 BC",
    origin: "Eurasia",
    description: "Bearer of the great crown, wandering the ancient emerald forests.",
    story: "Her antlers are not for war, but for connecting to the stars. The Irish Elk symbolizes the grandeur of nature that cannot be contained.",
    imageUrl: "https://picsum.photos/id/1074/600/600" // Lion/Animal placeholder
  }
};

export const EVOLUTION_THRESHOLDS = {
  [LifeStage.INFANT]: { hunger: 0, intimacy: 0, health: 0 },
  [LifeStage.ADULT]: { hunger: 30, intimacy: 30, health: 30 },
  [LifeStage.BREEDING]: { hunger: 100, intimacy: 100, health: 100 },
  [LifeStage.MATRIARCH]: { hunger: 200, intimacy: 200, health: 200 }
};

export const INTERACTION_GAINS = {
  FEED: 10,
  PET: 10,
  CLEAN: 10
};

export const MINT_COSTS = {
  FIRST: 0.0001,
  SUBSEQUENT: 0.001
};
