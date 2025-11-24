import React, { useState } from 'react';
import { Pet, LifeStage } from '../types';
import { SPECIES_DB, INTERACTION_GAINS, EVOLUTION_THRESHOLDS } from '../constants';
import { generatePetReaction } from '../services/geminiService';
import { Heart, Utensils, Sparkles, Zap } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  onUpdate: (updatedPet: Pet, evolutionOccurred: boolean) => void;
}

// Pixel progress bar component
const PixelBar: React.FC<{ value: number; max: number; color: string; icon: React.ReactNode }> = ({ value, max, color, icon }) => {
    const chunks = 10;
    const filledChunks = Math.ceil((value / max) * chunks);
    
    return (
        <div className="flex items-center gap-2 mb-2">
            <div className="text-mc-dark">{icon}</div>
            <div className="flex-1 flex gap-1">
                {Array.from({ length: chunks }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 h-6 border-2 border-black ${i < filledChunks ? color : 'bg-gray-400/30'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export const PetCard: React.FC<PetCardProps> = ({ pet, onUpdate }) => {
  const [reaction, setReaction] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const speciesData = SPECIES_DB[pet.speciesId];

  const handleInteract = async (type: 'feed' | 'pet' | 'clean') => {
    if (loading) return;
    setLoading(true);

    const newStats = { ...pet.stats };
    
    if (type === 'feed') newStats.hunger = Math.min(newStats.hunger + INTERACTION_GAINS.FEED, 200);
    if (type === 'pet') newStats.intimacy = Math.min(newStats.intimacy + INTERACTION_GAINS.PET, 200);
    if (type === 'clean') newStats.health = Math.min(newStats.health + INTERACTION_GAINS.CLEAN, 200);

    // Check evolution logic (simplified for demo)
    let newStage = pet.stage;
    let evolved = false;
    
    const checkEvolution = (currentStage: LifeStage, nextStage: LifeStage, thresholdStage: LifeStage) => {
       const t = EVOLUTION_THRESHOLDS[thresholdStage];
       if (newStats.hunger >= t.hunger && 
           newStats.intimacy >= t.intimacy && 
           newStats.health >= t.health) {
           return nextStage;
       }
       return currentStage;
    };

    if (pet.stage === LifeStage.INFANT) {
        newStage = checkEvolution(LifeStage.INFANT, LifeStage.ADULT, LifeStage.ADULT);
    } else if (pet.stage === LifeStage.ADULT) {
        newStage = checkEvolution(LifeStage.ADULT, LifeStage.BREEDING, LifeStage.BREEDING);
    } else if (pet.stage === LifeStage.BREEDING) {
        newStage = checkEvolution(LifeStage.BREEDING, LifeStage.MATRIARCH, LifeStage.MATRIARCH);
    }

    if (newStage !== pet.stage) evolved = true;

    const updatedPet = { ...pet, stats: newStats, stage: newStage };

    // Get AI reaction
    const aiText = await generatePetReaction(updatedPet, evolved ? 'evolve' : type);
    setReaction(aiText);
    
    onUpdate(updatedPet, evolved);
    setLoading(false);
  };

  return (
    <div className="pixel-panel w-full max-w-md mx-auto p-4 relative">
      {/* Header Strip */}
      <div className="bg-mc-dark text-white p-2 font-pixel text-xs mb-4 text-center border-2 border-black shadow-pixel-sm">
         GEN {pet.generation} | {pet.stage.toUpperCase()}
      </div>

      {/* Image Container */}
      <div className="relative w-full aspect-square mb-4 border-4 border-mc-dark bg-black p-2 shadow-pixel-in">
        <div className="w-full h-full bg-mc-dirt relative overflow-hidden">
            <img 
            src={speciesData.imageUrl} 
            alt={pet.name} 
            className="w-full h-full object-cover image-pixelated" 
            style={{ imageRendering: 'pixelated' }}
            />
            {/* Scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAYAAABS3WWCAAAAE0lEQVQIW2NkYGD4z8DAwMgAAQAAYgcDAAAAAAA=')] opacity-20"></div>
        </div>
      </div>

      {/* Name Plate */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-pixel text-mc-text mb-1">{pet.name}</h2>
        <p className="text-sm font-retro text-mc-dark bg-white inline-block px-2 border border-black">{speciesData.name}</p>
      </div>

      {/* Stats Bars (Chunks) */}
      <div className="w-full p-4 bg-mc-iron border-2 border-black mb-6">
        <PixelBar 
            value={pet.stats.hunger} 
            max={200} 
            color="bg-orange-500" 
            icon={<Utensils size={20} />} 
        />
        <PixelBar 
            value={pet.stats.intimacy} 
            max={200} 
            color="bg-red-500" 
            icon={<Heart size={20} />} 
        />
        <PixelBar 
            value={pet.stats.health} 
            max={200} 
            color="bg-green-500" 
            icon={<Zap size={20} />} 
        />
      </div>

      {/* AI Dialogue Box */}
      <div className="w-full min-h-[80px] bg-mc-dark border-4 border-black p-3 mb-6 relative">
         <div className="absolute -top-3 left-4 bg-white text-black px-2 font-pixel text-[10px] border border-black">PET SAYS:</div>
         {loading ? (
             <p className="text-green-400 font-retro text-xl animate-pulse">Thinking...</p>
         ) : (
             <p className="text-white font-retro text-xl leading-tight">{reaction || "Waiting for input..."}</p>
         )}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button 
            onClick={() => handleInteract('feed')}
            disabled={loading}
            className="pixel-btn bg-orange-200 border-orange-800 text-orange-900 hover:bg-orange-300 py-4 flex flex-col items-center gap-1 shadow-[4px_4px_0px_0px_#9a3412]">
            <Utensils size={24} />
            FEED
        </button>
        <button 
            onClick={() => handleInteract('pet')}
            disabled={loading}
            className="pixel-btn bg-red-200 border-red-800 text-red-900 hover:bg-red-300 py-4 flex flex-col items-center gap-1 shadow-[4px_4px_0px_0px_#991b1b]">
            <Heart size={24} />
            PET
        </button>
        <button 
            onClick={() => handleInteract('clean')}
            disabled={loading}
            className="pixel-btn bg-green-200 border-green-800 text-green-900 hover:bg-green-300 py-4 flex flex-col items-center gap-1 shadow-[4px_4px_0px_0px_#166534]">
            <Sparkles size={24} />
            CLEAN
        </button>
      </div>
    </div>
  );
};