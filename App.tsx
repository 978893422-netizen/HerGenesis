import React, { useState } from 'react';
import { UserState, GameState, SpeciesType, Pet, LifeStage } from './types';
import { SPECIES_DB, MINT_COSTS } from './constants';
import { connectWallet, mintPet, updatePetOnChain } from './services/web3Service';
import { PopulationChart } from './components/PopulationChart';
import { PetCard } from './components/PetCard';
import { Dna, Wallet, Plus, ChevronRight, Menu, X, Gamepad2, CreditCard, Smartphone, Globe, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<UserState>({
    walletAddress: null,
    balance: 0,
    inventory: []
  });

  // Mock global data
  const [gameState, setGameState] = useState<GameState>({
    globalPopulation: {
      [SpeciesType.DODO]: 142,
      [SpeciesType.MAMMOTH]: 89,
      [SpeciesType.THYLACINE]: 56,
      [SpeciesType.IRISH_ELK]: 34
    },
    populationHistory: [
        { date: 'MON', Dodo: 120, Mammoth: 80, Thylacine: 50, 'Irish Elk': 30 },
        { date: 'TUE', Dodo: 132, Mammoth: 82, Thylacine: 52, 'Irish Elk': 31 },
        { date: 'WED', Dodo: 135, Mammoth: 85, Thylacine: 54, 'Irish Elk': 32 },
        { date: 'THU', Dodo: 142, Mammoth: 89, Thylacine: 56, 'Irish Elk': 34 },
    ]
  });

  const [view, setView] = useState<'landing' | 'gallery' | 'mypets'>('landing');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Handlers ---

  const handleWalletSelect = async (type: 'injected' | 'coinbase' | 'walletconnect') => {
    setErrorMsg(null);
    try {
      const data = await connectWallet(type);
      setUser(prev => ({ ...prev, walletAddress: data.address, balance: parseFloat(data.balance) }));
      setWalletModalOpen(false);
    } catch (e: any) {
      console.error("Connection failed", e);
      setErrorMsg(e.message || "Failed to connect wallet");
    }
  };

  const handleMint = async (species: SpeciesType | null) => {
    if (!user.walletAddress) {
        setMobileMenuOpen(false);
        setWalletModalOpen(true);
        return; 
    }

    setIsMinting(true);
    setErrorMsg(null);
    try {
      // Logic for minting with real transaction
      const newPet = await mintPet(user.walletAddress, species, user.inventory.length);
      
      setUser(prev => ({
        ...prev,
        inventory: [...prev.inventory, newPet]
      }));
      
      setGameState(prev => ({
        ...prev,
        globalPopulation: {
            ...prev.globalPopulation,
            [newPet.speciesId]: prev.globalPopulation[newPet.speciesId] + 1
        }
      }));

      setSelectedPetId(newPet.id);
      setView('mypets');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Transaction failed");
    } finally {
      setIsMinting(false);
    }
  };

  const handlePetUpdate = async (updatedPet: Pet, evolutionOccurred: boolean) => {
    setUser(prev => ({
        ...prev,
        inventory: prev.inventory.map(p => p.id === updatedPet.id ? updatedPet : p)
    }));

    if (evolutionOccurred && (updatedPet.stage === LifeStage.BREEDING || updatedPet.stage === LifeStage.MATRIARCH)) {
       setGameState(prev => ({
           ...prev,
           globalPopulation: {
               ...prev.globalPopulation,
               [updatedPet.speciesId]: prev.globalPopulation[updatedPet.speciesId] + 2
           }
       }));
       await updatePetOnChain(updatedPet);
    }
  };

  // --- Render Helpers ---

  const WalletModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="pixel-panel w-full max-w-md p-6 relative animate-[fadeIn_0.2s_ease-out]">
        <button 
          onClick={() => { setWalletModalOpen(false); setErrorMsg(null); }}
          className="absolute top-2 right-2 hover:text-red-600">
          <X size={24} />
        </button>
        
        <h3 className="text-xl font-pixel mb-6 text-center border-b-4 border-black pb-4">SELECT CONTROLLER</h3>
        
        {errorMsg && (
          <div className="bg-red-100 border-l-4 border-red-600 text-red-900 p-2 mb-4 font-retro text-lg">
            ERROR: {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => handleWalletSelect('injected')}
            className="w-full pixel-btn bg-orange-100 hover:bg-orange-200 border-black p-4 flex items-center gap-4 text-left shadow-pixel-sm">
            <div className="w-10 h-10 bg-orange-500 border-2 border-black flex items-center justify-center text-white">
              <Globe size={20} />
            </div>
            <div>
              <div className="font-pixel text-xs mb-1">ONEKEY / BROWSER</div>
              <div className="font-retro text-gray-600 text-lg">OneKey, MetaMask, Brave...</div>
            </div>
          </button>

          <button 
            onClick={() => handleWalletSelect('walletconnect')}
            className="w-full pixel-btn bg-blue-100 hover:bg-blue-200 border-black p-4 flex items-center gap-4 text-left shadow-pixel-sm">
            <div className="w-10 h-10 bg-blue-500 border-2 border-black flex items-center justify-center text-white">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="font-pixel text-xs mb-1">WALLET CONNECT</div>
              <div className="font-retro text-gray-600 text-lg">Scan QR Code</div>
            </div>
          </button>

          <button 
            onClick={() => handleWalletSelect('coinbase')}
            className="w-full pixel-btn bg-blue-50 hover:bg-blue-100 border-black p-4 flex items-center gap-4 text-left shadow-pixel-sm">
            <div className="w-10 h-10 bg-blue-700 border-2 border-black flex items-center justify-center text-white">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="font-pixel text-xs mb-1">COINBASE</div>
              <div className="font-retro text-gray-600 text-lg">Smart Wallet</div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center font-retro text-gray-500 text-sm">
          SECURE CONNECTION via ETHEREUM
        </div>
      </div>
    </div>
  );

  const LoadingOverlay = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="text-mc-diamond animate-spin mb-4">
         <Loader2 size={64} />
      </div>
      <h2 className="text-2xl font-pixel text-white mb-2 animate-pulse">TRANSMITTING...</h2>
      <p className="font-retro text-xl text-gray-400">Please confirm transaction in wallet</p>
    </div>
  );

  const renderLanding = () => (
    <div className="flex flex-col items-center pt-12 px-4 text-center max-w-6xl mx-auto">
      
      <div className="mb-12 relative group">
          <h1 className="text-4xl md:text-6xl font-pixel text-white pixel-text-shadow mb-4 text-mc-diamond leading-relaxed">
            HerGenesis
          </h1>
          <div className="inline-block bg-mc-dark text-mc-gold border-4 border-black px-4 py-2 font-retro text-xl transform -rotate-2 shadow-pixel">
            REVIVE. BREED. EVOLVE.
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
         {/* Action Box 1 */}
         <div className="pixel-panel p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform">
            <div className="bg-mc-grass w-16 h-16 mb-4 border-4 border-black flex items-center justify-center shadow-pixel-sm">
                <Dna size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-pixel mb-2">START REVIVAL</h3>
            <p className="font-retro text-lg mb-6">Mint your first random companion. Extinction ends here.</p>
            
            <button 
                onClick={() => handleMint(null)}
                disabled={isMinting}
                className="pixel-btn w-full bg-mc-rose text-white border-black hover:bg-pink-600 py-4 shadow-[4px_4px_0px_0px_#880e4f] disabled:opacity-50">
                {isMinting ? 'INITIALIZING...' : `INSERT COIN (${MINT_COSTS.FIRST} ETH)`}
            </button>
         </div>

         {/* Action Box 2 */}
         <div className="pixel-panel p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform">
             <div className="bg-mc-diamond w-16 h-16 mb-4 border-4 border-black flex items-center justify-center shadow-pixel-sm">
                <Gamepad2 size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-pixel mb-2">SPECIES DEX</h3>
            <p className="font-retro text-lg mb-6">View the archives of the lost matriarchs.</p>
            
            <button 
                onClick={() => setView('gallery')}
                className="pixel-btn w-full bg-mc-diamond text-black border-black hover:bg-cyan-400 py-4 shadow-[4px_4px_0px_0px_#006064]">
                ENTER LIBRARY
            </button>
         </div>
      </div>

      <div className="w-full mb-12">
         <PopulationChart data={gameState.populationHistory} />
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-pixel text-white pixel-text-shadow mb-2">THE ARCHIVES</h2>
        <p className="font-retro text-xl text-mc-panel">Select a species to revive.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.values(SPECIES_DB).map((species) => (
          <div key={species.id} className="pixel-panel p-0 flex flex-col">
            <div className="h-48 bg-black border-b-4 border-black relative">
              <img 
                src={species.imageUrl} 
                alt={species.name} 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                style={{ imageRendering: 'pixelated' }} 
              />
              <div className="absolute bottom-0 left-0 bg-mc-dark text-white px-2 py-1 font-pixel text-[10px]">
                EXT: {species.extinctionYear}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
               <h3 className="text-md font-pixel mb-1">{species.name}</h3>
               <p className="text-xs font-retro text-gray-600 mb-4 uppercase">{species.origin}</p>
               <p className="text-lg font-retro leading-tight mb-4 flex-1 border-t-2 border-dashed border-gray-500 pt-2">{species.story}</p>
               
               <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2 font-pixel text-xs">
                      <span>POP:</span>
                      <span className="text-mc-rose">{gameState.globalPopulation[species.id]}</span>
                  </div>
                  <button 
                    onClick={() => handleMint(species.id)}
                    className="pixel-btn w-full bg-mc-gold text-black border-black hover:bg-yellow-300 py-2 shadow-[2px_2px_0px_0px_#f57f17]">
                    REVIVE ({MINT_COSTS.SUBSEQUENT} ETH)
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMyPets = () => {
    if (!user.walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="pixel-panel p-12 flex flex-col items-center">
                    <Wallet size={48} className="text-mc-dark mb-4" />
                    <h2 className="text-2xl font-pixel mb-4">NO WALLET</h2>
                    <button 
                        onClick={() => setWalletModalOpen(true)}
                        className="pixel-btn bg-mc-grass text-white border-black px-8 py-4 shadow-[4px_4px_0px_0px_#1b5e20]">
                        CONNECT TO START
                    </button>
                </div>
            </div>
        );
    }

    if (user.inventory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                 <div className="pixel-panel p-12 flex flex-col items-center">
                    <h2 className="text-2xl font-pixel mb-4">EMPTY BOX</h2>
                    <p className="font-retro text-xl mb-6">No digital life found in storage.</p>
                    <button onClick={() => setView('landing')} className="pixel-btn bg-mc-rose text-white px-6 py-3 shadow-pixel">
                        GO TO GENESIS
                    </button>
                 </div>
            </div>
        );
    }

    const currentPet = user.inventory.find(p => p.id === selectedPetId) || user.inventory[0];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] max-w-7xl mx-auto p-4 gap-4">
            {/* Sidebar List (Inventory Style) */}
            <div className="w-full md:w-72 pixel-panel p-2 flex flex-col overflow-hidden">
                <h3 className="text-sm font-pixel mb-4 p-2 bg-mc-dark text-white text-center">STORAGE BOX</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {user.inventory.map(pet => (
                        <div 
                            key={pet.id}
                            onClick={() => setSelectedPetId(pet.id)}
                            className={`p-2 border-2 cursor-pointer flex items-center gap-3 transition-all ${currentPet.id === pet.id ? 'bg-white border-black shadow-pixel-in' : 'bg-mc-panel border-transparent hover:bg-white/50'}`}>
                            <div className="w-10 h-10 border-2 border-black bg-mc-dirt">
                                <img src={SPECIES_DB[pet.speciesId].imageUrl} className="w-full h-full object-cover" style={{imageRendering: 'pixelated'}} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-pixel text-[10px] truncate">{pet.name}</div>
                                <div className="font-retro text-lg leading-none text-gray-600">{pet.stage}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => handleMint(null)}
                    className="pixel-btn w-full mt-4 bg-mc-iron border-black py-2 text-[10px] flex items-center justify-center gap-2 hover:bg-white">
                    <Plus size={12} /> NEW SLOT
                </button>
            </div>
            
            {/* Main Interaction Area */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <PetCard pet={currentPet} onUpdate={handlePetUpdate} />
                    
                    {/* Info Footer */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                         <div className="bg-black border-2 border-white/20 p-2">
                             <div className="text-[10px] font-pixel text-gray-400 mb-1">AGE</div>
                             <div className="font-retro text-xl text-mc-diamond">{(Date.now() - currentPet.birthDate) > 0 ? Math.floor((Date.now() - currentPet.birthDate)/1000/60) + 'm' : '0m'}</div>
                         </div>
                         <div className="bg-black border-2 border-white/20 p-2">
                             <div className="text-[10px] font-pixel text-gray-400 mb-1">GEN</div>
                             <div className="font-retro text-xl text-purple-400">{currentPet.generation}</div>
                         </div>
                         <div className="bg-black border-2 border-white/20 p-2">
                             <div className="text-[10px] font-pixel text-gray-400 mb-1">STATE</div>
                             <div className="font-retro text-xl text-mc-rose">{currentPet.stage === 'Infant' ? 'BABY' : currentPet.stage.toUpperCase().substring(0,5)}</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-retro">
      {walletModalOpen && <WalletModal />}
      {isMinting && <LoadingOverlay />}

      {/* Navigation */}
      <nav className="h-20 bg-mc-dark border-b-4 border-black flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shadow-pixel">
        <div 
            onClick={() => setView('landing')}
            className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-mc-rose border-4 border-white flex items-center justify-center group-hover:bg-white group-hover:border-mc-rose transition-colors">
                <div className="w-4 h-4 bg-black"></div>
            </div>
            <span className="font-pixel text-lg md:text-xl text-white tracking-tight group-hover:text-mc-rose">HerGenesis</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('landing')} className={`font-pixel text-xs ${view === 'landing' ? 'text-mc-rose underline' : 'text-gray-400 hover:text-white'}`}>HOME</button>
            <button onClick={() => setView('gallery')} className={`font-pixel text-xs ${view === 'gallery' ? 'text-mc-rose underline' : 'text-gray-400 hover:text-white'}`}>GALLERY</button>
            <button onClick={() => setView('mypets')} className={`font-pixel text-xs ${view === 'mypets' ? 'text-mc-rose underline' : 'text-gray-400 hover:text-white'}`}>SANCTUARY</button>
        </div>

        <div className="hidden md:block">
            {user.walletAddress ? (
                <div className="flex items-center gap-3 bg-black px-4 py-2 border-2 border-gray-600">
                    <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                    <span className="font-retro text-xl text-white pt-1">
                        {user.walletAddress.substring(0, 6)}...
                    </span>
                    <span className="font-pixel text-[10px] text-mc-gold pt-1 ml-2">
                        {parseFloat(user.balance.toString()).toFixed(3)} ETH
                    </span>
                </div>
            ) : (
                <button 
                    onClick={() => setWalletModalOpen(true)}
                    className="pixel-btn bg-mc-grass text-white border-white px-4 py-2 hover:bg-green-500 shadow-[2px_2px_0px_0px_#fff]">
                    CONNECT
                </button>
            )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 top-20 z-40 bg-mc-dark/95 backdrop-blur-none md:hidden flex flex-col p-8 space-y-8 border-t-4 border-white">
              <button onClick={() => { setView('landing'); setMobileMenuOpen(false); }} className="text-2xl font-pixel text-white text-left hover:text-mc-rose">> HOME</button>
              <button onClick={() => { setView('gallery'); setMobileMenuOpen(false); }} className="text-2xl font-pixel text-white text-left hover:text-mc-rose">> GALLERY</button>
              <button onClick={() => { setView('mypets'); setMobileMenuOpen(false); }} className="text-2xl font-pixel text-white text-left hover:text-mc-rose">> SANCTUARY</button>
              <div className="h-1 bg-gray-700 w-full my-4"></div>
              {user.walletAddress ? (
                   <div className="text-xl font-retro text-green-400 break-all border-2 border-gray-600 p-4 bg-black">CONNECTED: {user.walletAddress.substring(0,10)}...</div>
              ) : (
                  <button onClick={() => { setMobileMenuOpen(false); setWalletModalOpen(true); }} className="pixel-btn bg-mc-grass text-white border-white py-4 text-center">CONNECT WALLET</button>
              )}
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative">
        {view === 'landing' && renderLanding()}
        {view === 'gallery' && renderGallery()}
        {view === 'mypets' && renderMyPets()}
      </main>

      {/* Footer */}
      <footer className="bg-mc-dark border-t-4 border-black py-8 text-center text-gray-500 text-sm font-retro">
          <p className="mb-2">HER_GENESIS.EXE © 2024</p>
          <div className="flex justify-center gap-4 uppercase">
              <span>Eth Testnet</span>
              <span>[•]</span>
              <span>Gemini Core</span>
          </div>
      </footer>
    </div>
  );
};

export default App;