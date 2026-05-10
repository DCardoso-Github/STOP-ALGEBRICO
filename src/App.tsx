/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Hand, 
  Trophy, 
  Dices,
  Settings,
  Users,
  Plus,
  Trash2,
  ChevronRight,
  Clock,
  LayoutGrid,
  Zap,
  Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPRESSIONS, GameState, ExpressionTemplate, Group, Difficulty } from './constants.ts';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const EMOJI_DATA = [
  { char: '🐶', name: 'Cachorro' }, { char: '🐱', name: 'Gato' }, { char: '🐭', name: 'Rato' },
  { char: '🐹', name: 'Hamster' }, { char: '🐰', name: 'Coelho' }, { char: '🦊', name: 'Raposa' },
  { char: '🐻', name: 'Urso' }, { char: '🐼', name: 'Panda' }, { char: '🐨', name: 'Coala' },
  { char: '🐯', name: 'Tigre' }, { char: '🦁', name: 'Leão' }, { char: '🐮', name: 'Vaca' },
  { char: '🐷', name: 'Porco' }, { char: '🐸', name: 'Sapo' }, { char: '🐵', name: 'Macaco' },
  { char: '🐔', name: 'Galinha' }, { char: '🐧', name: 'Pinguim' }, { char: '🐦', name: 'Pássaro' },
  { char: '🐤', name: 'Pintinho' }, { char: '🐺', name: 'Lobo' }, { char: '🦓', name: 'Zebra' },
  { char: '🦒', name: 'Girafa' }, { char: '🐘', name: 'Elefante' }, { char: '🦏', name: 'Rinoceronte' },
  { char: '🦛', name: 'Hipopótamo' }, { char: '🐪', name: 'Camelo' }, { char: '🐳', name: 'Baleia' },
  { char: '🐊', name: 'Jacaré' }, { char: '🐢', name: 'Tartaruga' }, { char: '🐍', name: 'Cobra' }
];

const EMOJIS = EMOJI_DATA.map(e => e.char);

const AVATAR_COLORS = [
  '#FF4757', '#2ED573', '#70A1FF', '#ECCC68', '#FF7F50', '#1E90FF', 
  '#A29BFE', '#FD79A8', '#FAB1A0', '#00B894', '#0984E3', '#6C5CE7'
];

export default function App() {
  // Game Setup State
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState(EMOJI_DATA[0].name);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  
  // Config State
  const [numRounds, setNumRounds] = useState(5);
  const [roundSequence, setRoundSequence] = useState<{x: number, y: number}[]>([]);
  const [timePerRound, setTimePerRound] = useState(60);
  const [numExpressions, setNumExpressions] = useState(4);
  const [useTwoVariables, setUseTwoVariables] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);

  // Active Game State
  const [currentRound, setCurrentRound] = useState(1);
  const [variables, setVariables] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  const [activeExpressions, setActiveExpressions] = useState<ExpressionTemplate[]>([]);
  const [timer, setTimer] = useState(60);
  const [isDrawing, setIsDrawing] = useState(false);
  const [roundPoints, setRoundPoints] = useState<Record<string, number>>({});
  const [penalizedGroups, setPenalizedGroups] = useState<Record<string, boolean>>({});
  const [showStopOverlay, setShowStopOverlay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Management Logic
  const addGroup = () => {
    // Check if emoji is already taken
    const isEmojiTaken = groups.some(g => g.avatar === selectedEmoji);
    if (isEmojiTaken) {
      alert('Este ícone já está sendo usado por outro grupo!');
      return;
    }

    if (newGroupName.trim() && groups.length < 15) {
      setGroups([...groups, { 
        id: Date.now().toString(), 
        name: newGroupName.trim(), 
        avatar: selectedEmoji,
        totalScore: 0 
      }]);
      
      // Auto-assign next available emoji and its name
      const usedAvatars = [...groups, { avatar: selectedEmoji }].map(g => g.avatar);
      const nextAvailable = EMOJI_DATA.find(e => !usedAvatars.includes(e.char)) || EMOJI_DATA[0];
      
      setSelectedEmoji(nextAvailable.char);
      setNewGroupName(nextAvailable.name);
      
      const nextColorIdx = (AVATAR_COLORS.indexOf(selectedColor) + 1) % AVATAR_COLORS.length;
      setSelectedColor(AVATAR_COLORS[nextColorIdx]);
    }
  };

  const handleEmojiSelect = (emojiChar: string) => {
    const isEmojiTaken = groups.some(g => g.avatar === emojiChar);
    if (isEmojiTaken) return;

    const emojiInfo = EMOJI_DATA.find(e => e.char === emojiChar);
    setSelectedEmoji(emojiChar);
    
    // Suggest name if current name is empty or matches another animal name
    const currentNameIsAnimal = EMOJI_DATA.some(e => e.name === newGroupName);
    if (!newGroupName.trim() || currentNameIsAnimal) {
       setNewGroupName(emojiInfo?.name || '');
    }
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const getRankedGroups = () => {
    const sorted = [...groups].sort((a,b) => b.totalScore - a.totalScore);
    const ranks: { score: number, groups: Group[], rank: number }[] = [];
    let currentRank = 0;
    let lastScore = -1;
    
    sorted.forEach((group) => {
      if (group.totalScore !== lastScore) {
        currentRank++;
        lastScore = group.totalScore;
      }
      
      const existingRank = ranks.find(r => r.rank === currentRank);
      if (existingRank) {
        existingRank.groups.push(group);
      } else {
        ranks.push({ score: group.totalScore, groups: [group], rank: currentRank });
      }
    });
    
    return ranks;
  };

  const startNewGame = () => {
    if (groups.length === 0) {
      alert('Adicione pelo menos um grupo!');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate a brief calculation/shuffling time
    setTimeout(() => {
      setCurrentRound(1);
      const resetGroups = groups.map(g => ({ ...g, totalScore: 0 }));
      setGroups(resetGroups);
      
      // Generate unique pairs for up to 100 rounds (though limited to 10 in UI)
      const allPairs: {x: number, y: number}[] = [];
      for (let x = 1; x <= 10; x++) {
        for (let y = 1; y <= 10; y++) {
          allPairs.push({ x, y });
        }
      }
      const shuffledPairs = allPairs.sort(() => 0.5 - Math.random());
      setRoundSequence(shuffledPairs);
      
      // Select expressions ONCE for the entire game
      const pool = EXPRESSIONS.filter(e => {
        const varsMatch = useTwoVariables ? e.variables.length === 2 : e.variables.length === 1;
        const diffMatch = e.difficulty === selectedDifficulty;
        return varsMatch && diffMatch;
      });
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setActiveExpressions(shuffled.slice(0, numExpressions));
      
      setGameState(GameState.PREVIEW_EXPRESSIONS);
      setIsProcessing(false);
    }, 800);
  };

  const prepareRound = () => {
    setTimer(timePerRound);
    setGameState(GameState.PLAYING);
    setRoundPoints({});
    setPenalizedGroups({});
    drawVariables();
  };

  const drawVariables = () => {
    setIsDrawing(true);
    const finalVars = roundSequence[currentRound - 1] || { 
      x: Math.floor(Math.random() * 10) + 1, 
      y: Math.floor(Math.random() * 10) + 1 
    };

    let counter = 0;
    const interval = setInterval(() => {
      setVariables({
        x: Math.floor(Math.random() * 10) + 1,
        y: Math.floor(Math.random() * 10) + 1
      });
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setVariables(finalVars);
        setIsDrawing(false);
        startTimer();
      }
    }, 80);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowStopOverlay(true);
    setTimeout(() => {
      setShowStopOverlay(false);
      setGameState(GameState.SCORING);
    }, 2000);
  };

  const updateRoundPoints = (groupId: string, delta: number) => {
    if (penalizedGroups[groupId]) return; // locked if penalized
    
    const current = roundPoints[groupId] || 0;
    const maxPoints = numExpressions * 5;
    setRoundPoints({ 
      ...roundPoints, 
      [groupId]: Math.max(0, Math.min(maxPoints, current + delta)) 
    });
  };

  const handlePenalty = (groupId: string) => {
    if (penalizedGroups[groupId]) return;

    setRoundPoints(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || 0) - 10
    }));
    setPenalizedGroups(prev => ({
      ...prev,
      [groupId]: true
    }));
  };

  const submitRoundScores = () => {
    setIsProcessing(true);
    
    // Simulate finalizing scores
    setTimeout(() => {
      const updatedGroups = groups.map(g => ({
        ...g,
        totalScore: g.totalScore + (roundPoints[g.id] || 0)
      }));
      setGroups(updatedGroups);
      setGameState(GameState.PARTIAL_RESULTS);
      setIsProcessing(false);
    }, 1000);
  };

  const nextAction = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      if (currentRound < numRounds) {
        setCurrentRound(prev => prev + 1);
        prepareRound();
      } else {
        setGameState(GameState.RESULTS);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="h-[100dvh] w-full bg-game-bg flex items-center justify-center p-0 sm:p-2 md:p-4 font-sans text-game-text selection:bg-game-secondary selection:text-white overflow-hidden">
      <div className="w-full h-full max-w-6xl max-h-[850px] bg-game-surface border-4 border-game-primary/10 shadow-game md:rounded-[40px] flex flex-col relative overflow-hidden">
        
        {/* Header (Stopots Style) */}
        <header className="h-14 md:h-16 bg-game-primary flex items-center justify-between px-4 md:px-8 z-10 relative shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-game-accent p-1.5 rounded-lg shadow-sm">
              <Zap className="text-game-primary fill-game-primary" size={20} />
            </div>
            <div className="text-xl md:text-2xl font-black uppercase tracking-tight text-white italic">STOP ALGÉBRICO</div>
          </div>
          {gameState !== GameState.LOBBY && gameState !== GameState.RESULTS && (
            <div className="flex items-center gap-3 md:gap-6">
              <div className="font-black text-[10px] md:text-xs uppercase text-white/70 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 tracking-widest italic shrink-0">
                Rodada {currentRound}/{numRounds}
              </div>
            </div>
          )}
        </header>

        {/* STOP! Overlay */}
        <AnimatePresence>
          {showStopOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 z-[100] flex items-center justify-center bg-game-danger text-white font-black italic text-6xl md:text-9xl tracking-tighter shadow-2xl p-4 text-center"
            >
              STOP!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-game-primary/90 backdrop-blur-md text-white"
            >
              <div className="relative w-20 h-20 mb-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-full h-full border-4 border-white border-t-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-game-accent fill-game-accent animate-pulse" size={32} />
                </div>
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-black uppercase italic tracking-widest text-game-accent"
              >
                Processando...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">

            {/* Config & Groups Lobby */}
            {gameState === GameState.LOBBY && (
              <motion.div 
                key="lobby"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-md px-6 py-1 border-b border-white/10 shrink-0">
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-xl md:text-2xl font-black italic tracking-tighter text-white"
                  >
                    X-QUADRADO
                  </motion.h1>
                </div>

                <div className="px-4 md:px-8 pt-0 pb-6 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4 md:gap-6 flex-1 overflow-y-auto">
                {/* Groups Section */}
                <div className="flex flex-col h-full min-h-0 bg-game-bg/50 rounded-3xl p-4 md:pt-4 md:px-6 md:pb-6 border-2 border-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Users className="text-game-primary" size={24} />
                       <h2 className="text-lg md:text-xl font-black uppercase text-game-primary">Grupos ({groups.length}/15)</h2>
                    </div>
                  </div>
                  
                  {groups.length < 15 && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 mb-4 shrink-0">
                      <div className="flex gap-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md border-4 border-white transition-all transform hover:scale-105"
                          style={{ backgroundColor: selectedColor }}
                        >
                          {selectedEmoji}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            placeholder="NOME DO GRUPO..."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addGroup()}
                            className="w-full bg-game-bg rounded-xl px-4 py-2 font-black uppercase text-sm focus:ring-2 focus:ring-game-primary focus:outline-none placeholder:text-game-muted/50"
                          />
                          <button 
                            onClick={addGroup} 
                            className="w-full bg-game-success text-white py-2 rounded-xl font-black uppercase text-xs shadow-button-success active:translate-y-1 transition-all"
                          >
                            ADICIONAR
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1">
                          {EMOJI_DATA.map(emoji => {
                            const isTaken = groups.some(g => g.avatar === emoji.char);
                            return (
                              <button
                                key={emoji.char}
                                onClick={() => handleEmojiSelect(emoji.char)}
                                disabled={isTaken && selectedEmoji !== emoji.char}
                                className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all ${
                                  selectedEmoji === emoji.char 
                                    ? 'bg-game-primary text-white scale-110 shadow-sm' 
                                    : isTaken 
                                      ? 'bg-game-bg opacity-30 grayscale cursor-not-allowed' 
                                      : 'bg-game-bg hover:bg-game-bg/80'
                                }`}
                                title={isTaken ? 'Já utilizado' : emoji.name}
                              >
                                {emoji.char}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex flex-col gap-1 border-l-2 border-game-bg pl-2">
                          {AVATAR_COLORS.slice(0, 8).map(color => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              style={{ backgroundColor: color }}
                              className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColor === color ? 'border-game-primary scale-110' : 'border-white hover:scale-110'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <AnimatePresence>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {groups.map((group) => (
                          <motion.div 
                            key={group.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm group hover:ring-2 hover:ring-game-primary/30 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0"
                                style={{ backgroundColor: AVATAR_COLORS[groups.indexOf(group) % AVATAR_COLORS.length] }}
                              >
                                {group.avatar}
                              </div>
                              <span className="font-bold uppercase text-xs tracking-tight truncate">{group.name}</span>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeGroup(group.id)} 
                              className="p-2 text-game-danger hover:bg-game-danger/10 rounded-lg transition-all shrink-0"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                    {groups.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 gap-2 border-4 border-dashed border-game-primary/20 rounded-2xl">
                        <Users size={40} />
                        <span className="font-bold">ADICIONE OS GRUPOS</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings Section */}
                <div className="flex flex-col h-full bg-white rounded-3xl p-4 md:pt-4 md:px-6 md:pb-6 border-2 border-game-bg">
                  <div className="flex items-center gap-2 mb-6 shrink-0">
                    <Settings className="text-game-primary" size={24} />
                    <h2 className="text-xl font-black uppercase text-game-primary">Ajustes</h2>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-game-muted flex items-center gap-1">
                          <LayoutGrid size={12}/> Rodadas
                        </label>
                        <div className="flex items-center bg-game-bg rounded-2xl p-1 px-3">
                          <input type="number" min="1" max="10" value={numRounds} onChange={e => {
                            setNumRounds(Math.min(10, Math.max(1, Number(e.target.value))));
                          }} className="w-full text-lg font-black bg-transparent focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-game-muted flex items-center gap-1">
                          <Clock size={12}/> Tempo (s)
                        </label>
                        <div className="flex items-center bg-game-bg rounded-2xl p-1 px-3">
                           <input type="number" min="10" max="300" value={timePerRound} onChange={e => {
                             setTimePerRound(Math.max(10, Number(e.target.value)));
                           }} className="w-full text-lg font-black bg-transparent focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-game-muted">Expressões por Rodada (Máx 6)</label>
                      <div className="flex items-center bg-game-bg rounded-2xl p-3 px-4">
                         <input type="number" min="1" max="6" value={numExpressions} onChange={e => {
                           setNumExpressions(Math.min(6, Math.max(1, Number(e.target.value))));
                         }} className="w-full text-lg font-black bg-transparent focus:outline-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-game-muted">Complexidade</label>
                      <button 
                        onClick={() => {
                          setUseTwoVariables(!useTwoVariables);
                        }}
                        className={`w-full p-4 rounded-3xl font-black text-sm flex items-center justify-between transition-all ${useTwoVariables ? 'bg-game-primary text-white shadow-button' : 'bg-game-bg text-game-text'}`}
                      >
                        <span>Variáveis</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px]">{useTwoVariables ? 'X e Y' : 'Apenas X'}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-game-muted">Nível de Dificuldade</label>
                      <div className="grid grid-cols-3 gap-2 p-1 bg-game-bg rounded-2xl">
                        {(Object.values(Difficulty) as Difficulty[]).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => {
                              setSelectedDifficulty(diff);
                            }}
                            className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                              selectedDifficulty === diff 
                                ? 'bg-white text-game-primary shadow-sm scale-[1.02]' 
                                : 'text-game-muted hover:text-game-text'
                            }`}
                          >
                            {diff === Difficulty.EASY ? 'FÁCIL' : diff === Difficulty.MEDIUM ? 'MÉDIO' : 'DIFÍCIL'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={startNewGame}
                    className="w-full mt-8 py-4 md:py-5 bg-game-danger text-white rounded-[25px] font-black text-xl shadow-button-danger hover:scale-[1.02] active:translate-y-1 transition-all uppercase italic flex items-center justify-center gap-3 shrink-0"
                  >
                    <Play fill="white" size={24} /> JOGAR AGORA
                  </button>
                </div>
              </div>
            </motion.div>
          )}

            {/* Expression Preview */}
            {gameState === GameState.PREVIEW_EXPRESSIONS && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-6 md:p-10 flex flex-col items-center gap-6 h-full"
              >
                <div className="text-center">
                  <h2 className="text-2xl md:text-4xl font-black uppercase text-game-primary mb-2">Atenção às Expressões!</h2>
                  <p className="font-bold text-game-muted text-sm md:text-base">Mantenha essas fórmulas em mente:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full flex-1 overflow-y-auto custom-scrollbar p-2">
                  {activeExpressions.map((expr, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg border-2 border-game-bg text-center">
                      <div className="text-[10px] font-black uppercase text-game-primary/30 mb-2 tracking-widest italic">EXPRESSÃO {i+1}</div>
                      <div className="text-3xl md:text-4xl font-black text-game-text">
                        <InlineMath math={expr.latex} />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    prepareRound();
                  }}
                  className="w-full max-w-sm py-4 bg-game-success text-white rounded-3xl font-black text-xl shadow-button-success hover:scale-[1.02] transition-all uppercase italic mt-4 shrink-0"
                >
                  ESTAMOS PRONTOS!
                </button>
              </motion.div>
            )}

            {/* Game Screen (Presentation) */}
            {gameState === GameState.PLAYING && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-3 md:p-6 flex flex-col gap-4 md:gap-6 h-full"
              >
                {/* Variables Banner - More compact */}
                <div className="bg-game-primary rounded-3xl md:rounded-[30px] p-4 md:p-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 shadow-game shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute -top-10 -left-10 w-24 h-24 bg-white rounded-full blur-2xl" />
                     <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-game-accent rounded-full blur-2xl" />
                  </div>
                  
                  {/* Embedded Large Timer for better visibility */}
                  <div className="flex flex-col items-center justify-center px-8 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-12 relative z-10">
                    <div className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">TEMPO RESTANTE</div>
                    <motion.div 
                      key={timer}
                      initial={timer < 6 ? { scale: 1.2 } : {}}
                      animate={{ scale: 1 }}
                      className={`text-4xl md:text-6xl font-black tabular-nums tracking-tighter ${timer < 10 ? 'text-game-accent' : 'text-white'}`}
                    >
                      {timer}s
                    </motion.div>
                  </div>

                  <div className="flex flex-row items-center justify-center gap-8 md:gap-16 relative z-10">
                    <motion.div 
                      animate={isDrawing ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                      className="text-center flex items-center gap-4"
                    >
                      <div className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-[0.2em]">VALOR DE X</div>
                      <div className="text-5xl md:text-7xl font-black text-white drop-shadow-md">{variables.x}</div>
                    </motion.div>
                    {useTwoVariables && (
                      <motion.div 
                        animate={isDrawing ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.2, delay: 0.1 }}
                        className="text-center border-l border-white/20 pl-8 md:pl-16 flex items-center gap-4"
                      >
                        <div className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-[0.2em]">VALOR DE Y</div>
                        <div className="text-5xl md:text-7xl font-black text-white drop-shadow-md">{variables.y}</div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Expressions Display - Adaptive grid with scaled content */}
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  className={`grid gap-2 md:gap-3 overflow-y-auto custom-scrollbar p-1 flex-1 content-center ${
                    numExpressions <= 4 ? 'grid-cols-2' : 
                    numExpressions <= 8 ? 'grid-cols-2 lg:grid-cols-3' : 
                    'grid-cols-2 md:grid-cols-4'
                  }`}
                >
                  {activeExpressions.map((expr, i) => (
                    <motion.div 
                      key={i} 
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                      className="bg-white rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center shadow-md border border-game-bg text-center relative overflow-hidden group min-h-[90px] md:min-h-[110px]"
                    >
                      <div className="absolute top-0 left-0 w-1 bg-game-primary h-0 group-hover:h-full transition-all duration-300" />
                      <div className="text-[8px] font-black uppercase text-game-muted/40 mb-1 tracking-widest italic leading-none">EXPRESSÃO {i+1}</div>
                      <div className={`w-full overflow-hidden transition-transform duration-200 group-hover:scale-105 ${
                        numExpressions > 8 ? 'text-lg md:text-xl' : 
                        numExpressions > 4 ? 'text-xl md:text-3xl' : 
                        'text-3xl md:text-5xl'
                      } font-black text-game-text`}>
                        <div className="scale-90 sm:scale-100 origin-center truncate">
                          <InlineMath math={expr.latex} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-2 flex justify-center shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={handleStop} 
                    className="w-full max-w-xs bg-game-danger text-white text-2xl font-black py-3 md:py-4 rounded-[25px] shadow-button-danger italic transition-all appearance-none outline-none"
                  >
                    STOP!
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Scoring Screen (Teacher Entry) */}
            {gameState === GameState.SCORING && (
              <motion.div 
                key="scoring"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-4 md:p-8 flex flex-col h-full gap-6"
              >
                {/* Answers & Variable Tally - Synchronized with playing grid */}
                <div className="bg-game-primary/5 rounded-3xl p-4 md:p-6 border-2 border-game-primary/10 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black uppercase text-game-primary tracking-widest">GABARITO OFICIAL</h2>
                    <div className="flex gap-4 text-[10px] font-black text-game-muted uppercase">
                      <span>X = <span className="text-game-primary">{variables.x}</span></span>
                      {useTwoVariables && <span>Y = <span className="text-game-primary">{variables.y}</span></span>}
                    </div>
                  </div>
                  <div className={`grid gap-3 ${
                    numExpressions <= 4 ? 'grid-cols-2' : 
                    numExpressions <= 8 ? 'grid-cols-2 lg:grid-cols-3' : 
                    'grid-cols-2 md:grid-cols-4'
                  }`}>
                    {activeExpressions.map((expr, i) => (
                      <div key={i} className="p-2 md:p-3 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center border border-game-primary/10 relative overflow-hidden group min-h-[70px] md:min-h-[90px]">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-game-primary/20 group-hover:bg-game-primary transition-colors" />
                        <div className="text-[8px] md:text-[9px] font-bold text-game-muted/50 uppercase mb-1 tracking-tight">EXPRESSÃO {i+1}</div>
                        <div className="text-[10px] md:text-[11px] font-black text-game-muted mb-1 md:mb-2 opacity-80 scale-90 md:scale-95 overflow-hidden w-full text-center truncate">
                          <InlineMath math={expr.latex} />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-game-primary leading-none tabular-nums">
                          {expr.formula(variables)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points Entry - 3 Columns Layout */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-game-bg">
                  <h3 className="text-base md:text-lg font-black uppercase text-game-primary mb-3 md:mb-4 flex items-center gap-2 shrink-0">
                    <Hand size={20} /> ATRIBUIR PONTOS
                  </h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      {groups.map(group => (
                        <div key={group.id} className="bg-game-bg/30 rounded-2xl p-2.5 md:p-3 flex items-center justify-between hover:bg-game-bg/50 transition-colors">
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <span className="text-xl md:text-2xl shrink-0">{group.avatar}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-[10px] md:text-xs uppercase truncate leading-tight mb-0.5">{group.name}</span>
                              <motion.span 
                                key={`${group.id}-${roundPoints[group.id] || 0}`}
                                initial={{ scale: 1.5, color: penalizedGroups[group.id] ? '#FF4757' : '#2ED573' }}
                                animate={{ scale: 1, color: penalizedGroups[group.id] ? '#FF4757' : '#70A1FF' }}
                                className={`text-[8px] md:text-[9px] font-bold`}
                              >
                                {roundPoints[group.id] || 0} PTS {penalizedGroups[group.id] && '(PENALIZADO)'}
                              </motion.span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                             <button 
                                onClick={() => handlePenalty(group.id)}
                                disabled={penalizedGroups[group.id]}
                                className={`w-7 h-7 md:w-8 md:h-8 ${penalizedGroups[group.id] ? 'bg-game-danger/50 text-white shadow-inner' : 'bg-white text-game-danger'} border border-game-danger/20 rounded-lg font-black flex items-center justify-center hover:bg-game-danger hover:text-white transition-all shadow-sm`}
                                title="Penalty: Dirty Play"
                             >
                                <Zap size={14} className={penalizedGroups[group.id] ? 'animate-pulse' : ''} />
                             </button>
                             <button
                                onClick={() => updateRoundPoints(group.id, -5)}
                                disabled={penalizedGroups[group.id]}
                                className={`w-7 h-7 md:w-8 md:h-8 ${penalizedGroups[group.id] ? 'bg-white/50 text-game-danger/30 cursor-not-allowed' : 'bg-white text-game-danger hover:bg-game-danger hover:text-white'} border border-game-danger/20 rounded-lg font-black text-[10px] md:text-xs transition-all shadow-sm flex items-center justify-center`}
                             >
                               -5
                             </button>
                             <button 
                                onClick={() => updateRoundPoints(group.id, 5)}
                                disabled={penalizedGroups[group.id]}
                                className={`w-7 h-7 md:w-8 md:h-8 ${penalizedGroups[group.id] ? 'bg-game-success/30 cursor-not-allowed' : 'bg-game-success hover:scale-105 active:scale-95'} text-white rounded-lg font-black text-[10px] md:text-xs transition-all shadow-sm flex items-center justify-center`}
                             >
                               +5
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={submitRoundScores} className="w-full bg-game-primary text-white py-4 rounded-3xl font-black shadow-button flex items-center justify-center gap-2 hover:scale-[1.02] transition-all uppercase italic shrink-0">
                  PRÓXIMA RODADA <ChevronRight />
                </button>
              </motion.div>
            )}

            {/* Partial Results View */}
            {gameState === GameState.PARTIAL_RESULTS && (
              <motion.div 
                key="partial"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-10 flex flex-col items-center h-full"
              >
                <div className="w-full max-w-4xl bg-white rounded-[40px] p-6 md:p-8 shadow-game border border-game-bg flex flex-col min-h-0">
                  <h2 className="text-2xl font-black uppercase text-game-primary text-center mb-6 italic">CLASSIFICAÇÃO</h2>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    {groups.sort((a,b) => b.totalScore - a.totalScore).map((g, i) => (
                      <motion.div 
                        key={g.id} 
                        variants={{
                          hidden: { x: -20, opacity: 0 },
                          visible: { x: 0, opacity: 1 }
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${i === 0 ? 'bg-game-primary text-white shadow-lg ring-2 ring-game-accent/50' : 'bg-game-bg/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-inner text-game-text">
                               {g.avatar}
                             </div>
                             <span className={`absolute -top-2 -left-2 text-[9px] w-5 h-5 rounded-full border-2 flex items-center justify-center font-black ${i === 0 ? 'bg-game-accent text-game-primary border-white' : 'bg-game-primary text-white border-white'}`}>#{i+1}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-black uppercase italic tracking-tight leading-none mb-1">{g.name}</span>
                            <span className={`text-[9px] font-bold ${i === 0 ? 'text-white/60' : 'text-game-success'}`}>+ {roundPoints[g.id] || 0} PTS</span>
                          </div>
                        </div>
                        <motion.span 
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                          className="text-xl font-black tabular-nums"
                        >
                          {g.totalScore}
                        </motion.span>
                      </motion.div>
                    ))}
                  </motion.div>
                  </div>
                </div>

                <button 
                  onClick={nextAction}
                  className="w-full max-w-sm py-5 bg-game-success text-white rounded-3xl font-black text-2xl shadow-button-success hover:scale-[1.02] transition-all uppercase italic mt-8 shrink-0"
                >
                  {currentRound < numRounds ? `RODADA ${currentRound + 1}` : 'RESULTADO FINAL'}
                </button>
              </motion.div>
            )}

            {/* Results Screen */}
            {gameState === GameState.RESULTS && (() => {
              const ranks = getRankedGroups();
              const firstPlace = ranks.find(r => r.rank === 1);
              const secondPlace = ranks.find(r => r.rank === 2);
              const thirdPlace = ranks.find(r => r.rank === 3);
              const runnersUp = [...groups].sort((a,b) => b.totalScore - a.totalScore).filter(g => {
                const rank = ranks.find(r => r.groups.some(rg => rg.id === g.id))?.rank || 99;
                return rank > 3;
              });

              return (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 md:p-8 flex flex-col items-center h-full gap-4"
                >
                  <div className="w-full max-w-5xl bg-game-primary rounded-[40px] p-6 md:p-8 shadow-lg flex flex-col min-h-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                      <Trophy className="absolute -top-10 -right-10 rotate-12" size={300} />
                    </div>
                    
                    <div className="relative z-10 text-center mb-6 md:mb-10">
                      <Trophy className="text-game-accent mx-auto mb-2 drop-shadow-lg" size={48} strokeWidth={3} />
                      <h2 className="text-2xl md:text-4xl font-black uppercase text-white italic tracking-tighter">Vencedores!</h2>
                    </div>
                    
                    {/* Podium Section - Refined Grid Layout for Ties */}
                    <div className="relative z-10 flex items-end justify-center w-full gap-2 md:gap-4 mb-2 min-h-[220px] md:min-h-[300px] px-4">
                      
                      {/* 2nd Place Platform */}
                      <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center w-1/3 max-w-[150px]"
                      >
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {secondPlace?.groups.slice(0, 3).map(g => (
                            <div key={g.id} className="relative group">
                              <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-xl transition-transform group-hover:scale-110">
                                {g.avatar}
                              </div>
                              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-7 md:h-7 bg-slate-300 text-game-primary border-2 border-white rounded-full flex items-center justify-center font-black text-[8px] md:text-[10px] shadow-md">2º</span>
                            </div>
                          ))}
                          {secondPlace && secondPlace.groups.length > 3 && (
                            <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-[10px] font-black text-white">+ {secondPlace.groups.length - 3}</div>
                          )}
                        </div>
                        <div className="w-full bg-white/20 h-20 md:h-28 rounded-t-3xl flex flex-col items-center pt-3 px-2 text-white border-x border-t border-white/10 backdrop-blur-sm shadow-inner mt-auto">
                           {secondPlace && (
                             <>
                               <span className="font-black text-xs md:text-lg">{secondPlace.score}</span>
                               <span className="font-black uppercase text-[7px] md:text-[9px] opacity-60 text-center truncate w-full">PONTOS</span>
                             </>
                           )}
                        </div>
                      </motion.div>

                      {/* 1st Place Platform */}
                      <motion.div 
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col items-center w-1/3 max-w-[180px]"
                      >
                        <div className="flex flex-wrap justify-center gap-2 mb-3">
                          {firstPlace?.groups.slice(0, 2).map(g => (
                            <div key={g.id} className="relative group">
                              <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-[24px] flex items-center justify-center text-2xl md:text-4xl shadow-2xl ring-4 ring-game-accent/30 transition-transform group-hover:scale-110">
                                {g.avatar}
                              </div>
                              <div className="absolute -top-2 -right-2 w-7 h-7 md:w-10 md:h-10 bg-game-accent text-game-primary border-2 border-white rounded-full flex items-center justify-center font-black text-[10px] md:text-xs shadow-xl animate-bounce">
                                1º
                              </div>
                            </div>
                          ))}
                          {firstPlace && firstPlace.groups.length > 2 && (
                            <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center text-xs font-black text-white">+ {firstPlace.groups.length - 2}</div>
                          )}
                        </div>
                        <div className="w-full bg-white h-28 md:h-40 rounded-t-[40px] flex flex-col items-center pt-4 px-3 text-game-primary shadow-2xl relative overflow-hidden mt-auto">
                           <div className="absolute top-0 left-0 w-full h-1 bg-game-accent" />
                           {firstPlace && (
                             <>
                               <span className="font-black text-xl md:text-4xl italic tracking-tighter">{firstPlace.score}</span>
                               <span className="font-black uppercase text-[10px] md:text-sm tracking-widest opacity-40">PONTOS</span>
                             </>
                           )}
                        </div>
                      </motion.div>

                      {/* 3rd Place Platform */}
                      <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center w-1/3 max-w-[150px]"
                      >
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {thirdPlace?.groups.slice(0, 3).map(g => (
                            <div key={g.id} className="relative group">
                              <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center text-lg md:text-xl shadow-xl transition-transform group-hover:scale-110">
                                {g.avatar}
                              </div>
                              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-orange-400 text-white border-2 border-white rounded-full flex items-center justify-center font-black text-[7px] md:text-[9px] shadow-md">3º</span>
                            </div>
                          ))}
                          {thirdPlace && thirdPlace.groups.length > 3 && (
                            <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-[8px] font-black text-white">+ {thirdPlace.groups.length - 3}</div>
                          )}
                        </div>
                        <div className="w-full bg-white/10 h-14 md:h-20 rounded-t-2xl flex flex-col items-center pt-2 md:pt-3 px-2 text-white/90 border-x border-t border-white/5 backdrop-blur-sm shadow-inner mt-auto">
                           {thirdPlace && (
                             <>
                               <span className="font-black text-[8px] md:text-lg">{thirdPlace.score}</span>
                               <span className="font-black uppercase text-[6px] md:text-[9px] opacity-60 text-center truncate w-full">PONTOS</span>
                             </>
                           )}
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Others Row */}
                    {runnersUp.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="relative z-10 overflow-x-auto custom-scrollbar-hide pb-2 px-1 border-t border-white/5 pt-4"
                      >
                         <div className="flex gap-2 items-center min-w-max">
                            {runnersUp.map((g, idx) => {
                              const rank = ranks.find(r => r.groups.some(rg => rg.id === g.id))?.rank;
                              return (
                                <motion.div 
                                  key={g.id} 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 1.2 + idx * 0.1 }}
                                  className="bg-white/10 rounded-2xl flex items-center gap-2 p-1.5 pr-3 border border-white/5 backdrop-blur-sm group hover:bg-white/20 transition-all"
                                >
                                   <div className="relative shrink-0">
                                     <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-lg shadow-sm text-game-primary group-hover:scale-110 transition-transform">
                                       {g.avatar}
                                     </div>
                                     <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-game-primary border border-white/20 rounded-full flex items-center justify-center font-black text-[8px] text-white">#{rank}</span>
                                   </div>
                                   <div className="flex flex-col min-w-0">
                                     <span className="font-black text-[10px] text-white truncate max-w-[60px] leading-none mb-0.5">{g.totalScore}</span>
                                     <span className="font-bold text-[7px] uppercase text-white/40 truncate max-w-[60px] leading-none">{g.name}</span>
                                   </div>
                                </motion.div>
                              );
                            })}
                         </div>
                      </motion.div>
                    )}
                  </div>

                  <button onClick={() => setGameState(GameState.LOBBY)} className="w-full max-w-sm py-4 bg-white text-game-primary rounded-3xl font-black text-xl shadow-lg border-2 border-game-bg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all uppercase italic mt-2 shrink-0">
                    <RotateCcw /> NOVO JOGO
                  </button>
                </motion.div>
              );
            })()}

          </AnimatePresence>
        </main>

        <footer className="shrink-0 bg-game-bg text-game-muted text-[8px] md:text-[10px] font-black uppercase tracking-widest p-2 md:p-3 flex flex-col md:flex-row items-center gap-1 md:justify-between z-10 text-center border-t border-game-primary/5">
          <span>PROF. DAVI CARDOSO • CURSO MULTIPLICA SP</span>
          <span className="hidden md:inline bg-game-primary/10 text-game-primary px-3 py-1 rounded-full">MATEMÁTICA - 8º ANO</span>
        </footer>
      </div>
    </div>
  );
}
