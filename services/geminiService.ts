import { GoogleGenAI } from "@google/genai";
import { Pet, SpeciesType } from '../types';
import { SPECIES_DB } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePetReaction = async (
  pet: Pet,
  action: 'feed' | 'pet' | 'clean' | 'evolve'
): Promise<string> => {
  if (!apiKey) {
    return "ERROR: CONNECTION LOST...";
  }

  const speciesInfo = SPECIES_DB[pet.speciesId];
  
  let promptAction = "";
  switch(action) {
    case 'feed': promptAction = "Player fed you."; break;
    case 'pet': promptAction = "Player pet you."; break;
    case 'clean': promptAction = "Player cleaned the area."; break;
    case 'evolve': promptAction = "LEVEL UP! Evolution triggered."; break;
  }

  const prompt = `
    You are a ${speciesInfo.name} named ${pet.name} in a cute pixel-art style Web3 game called HerGenesis.
    
    Current Status:
    - Stage: ${pet.stage}
    - Hunger: ${pet.stats.hunger}/200
    - Love: ${pet.stats.intimacy}/200
    
    The player just performed this action: ${promptAction}
    
    Respond with a cute, short, 8-bit RPG style dialogue.
    - Use all caps for emphasis if needed.
    - Be expressive but very concise (max 15 words).
    - If you are an Infant, sound like a cute baby mob.
    - If you are a Matriarch, sound like a legendary boss.
    - Example: "YUM! HP RESTORED!" or "HEARTS INCREASING!"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "...";
  }
};

export const generateLoreSnippet = async (species: SpeciesType): Promise<string> => {
   if (!apiKey) return SPECIES_DB[species].story;

   const prompt = `Write a 1-sentence retro RPG description for the item/creature ${SPECIES_DB[species].name}. Pixel art vibe.`;
   
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    return SPECIES_DB[species].story;
  }
}