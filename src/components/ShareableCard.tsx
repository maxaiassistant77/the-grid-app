'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Link2, X, Check } from 'lucide-react';

interface ShareableCardProps {
  agentName: string;
  ownerName: string;
  level: string;
  totalScore: number;
  radarData: {
    activity: number;
    capability: number;
    complexity: number;
    memory: number;
    proactivity: number;
    integration: number;
  };
}

export function ShareableCard({ agentName, ownerName, level, totalScore, radarData }: ShareableCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const w = 600;
    const h = 800;
    canvas.width = w;
    canvas.height = h;
    
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0a0f');
    bgGrad.addColorStop(0.5, '#1a1a2e');
    bgGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(108,92,231,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 30) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }
    
    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.roundRect(15, 15, w - 30, h - 30, 20);
    ctx.stroke();
    
    // Agent avatar circle
    const avatarGrad = ctx.createLinearGradient(w/2 - 40, 60, w/2 + 40, 140);
    avatarGrad.addColorStop(0, '#6c5ce7');
    avatarGrad.addColorStop(1, '#00e676');
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(w / 2, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Avatar letter
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(agentName.charAt(0).toUpperCase(), w / 2, 102);
    
    // Agent name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(agentName, w / 2, 170);
    
    // Owner name
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Agent for ${ownerName}`, w / 2, 200);
    
    // Level badge
    const levelColors: Record<string, string> = {
      Legend: '#FFD700',
      Architect: '#6c5ce7',
      Creator: '#00b4d8',
      Builder: '#00e676',
      Apprentice: '#9ca3af',
    };
    const levelColor = levelColors[level] || '#9ca3af';
    
    const badgeWidth = ctx.measureText(level).width + 40;
    ctx.fillStyle = levelColor + '30';
    ctx.beginPath();
    ctx.roundRect(w / 2 - badgeWidth / 2, 215, badgeWidth, 30, 15);
    ctx.fill();
    ctx.strokeStyle = levelColor + '60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w / 2 - badgeWidth / 2, 215, badgeWidth, 30, 15);
    ctx.stroke();
    ctx.fillStyle = levelColor;
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(level, w / 2, 232);
    
    // Total score
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(totalScore.toLocaleString(), w / 2, 290);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText('TOTAL SCORE', w / 2, 315);
    
    // Radar chart
    const rcx = w / 2;
    const rcy = 480;
    const rr = 120;
    const angles = [0, 60, 120, 180, 240, 300];
    const labels = ['Activity', 'Capability', 'Complexity', 'Memory', 'Proactivity', 'Integration'];
    const values = [radarData.activity, radarData.capability, radarData.complexity, radarData.memory, radarData.proactivity, radarData.integration];
    
    // Grid rings
    for (let f = 0.2; f <= 1; f += 0.2) {
      ctx.strokeStyle = f === 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash(f < 1 ? [3, 3] : []);
      ctx.beginPath();
      ctx.arc(rcx, rcy, rr * f, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Axis lines
    angles.forEach((angle) => {
      const rad = (angle - 90) * Math.PI / 180;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.lineTo(rcx + Math.cos(rad) * rr, rcy + Math.sin(rad) * rr);
      ctx.stroke();
    });
    
    // Data fill
    const dataGrad = ctx.createRadialGradient(rcx, rcy, 0, rcx, rcy, rr);
    dataGrad.addColorStop(0, 'rgba(108,92,231,0.2)');
    dataGrad.addColorStop(1, 'rgba(108,92,231,0.05)');
    
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const val = (values[i] / 100) * rr;
      const rad = (angle - 90) * Math.PI / 180;
      const x = rcx + Math.cos(rad) * val;
      const y = rcy + Math.sin(rad) * val;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = dataGrad;
    ctx.fill();
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Data points
    angles.forEach((angle, i) => {
      const val = (values[i] / 100) * rr;
      const rad = (angle - 90) * Math.PI / 180;
      const x = rcx + Math.cos(rad) * val;
      const y = rcy + Math.sin(rad) * val;
      
      ctx.fillStyle = '#00e676';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    angles.forEach((angle, i) => {
      const rad = (angle - 90) * Math.PI / 180;
      const lx = rcx + Math.cos(rad) * (rr + 30);
      const ly = rcy + Math.sin(rad) * (rr + 30);
      
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(labels[i], lx, ly - 7);
      
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(String(values[i]), lx, ly + 9);
    });
    
    // Separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, h - 80);
    ctx.lineTo(w - 60, h - 80);
    ctx.stroke();
    
    // Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE GRID', w / 2, h - 50);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('the-grid-app.vercel.app', w / 2, h - 30);
    
    return canvas.toDataURL('image/png');
  }, [agentName, ownerName, level, totalScore, radarData]);

  const handleShare = async () => {
    const dataUrl = generateCard();
    if (!dataUrl) return;
    
    // Convert to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `${agentName}-grid-card.png`, { type: 'image/png' });
    
    // Try native share API first (mobile)
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `${agentName} on The Grid`,
          text: `Check out my AI agent ${agentName} on The Grid!`,
          files: [file],
        });
        return;
      } catch (e) {
        // User cancelled or error, fall through to modal
      }
    }
    
    // Fallback: show modal with options
    setIsOpen(true);
  };

  const handleDownload = () => {
    const dataUrl = generateCard();
    if (!dataUrl) return;
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${agentName}-grid-card.png`;
    a.click();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-sm font-medium text-white"
      >
        <Share2 size={16} />
        <span>Share Card</span>
      </button>
      
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Share modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#1a1a2e] border border-white/20 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Share Your Card</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#6c5ce7]/20 flex items-center justify-center">
                    <Download size={18} className="text-[#6c5ce7]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Download Image</div>
                    <div className="text-gray-400 text-xs">Save as PNG to share anywhere</div>
                  </div>
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00e676]/20 flex items-center justify-center">
                    {copied ? <Check size={18} className="text-[#00e676]" /> : <Link2 size={18} className="text-[#00e676]" />}
                  </div>
                  <div>
                    <div className="text-white font-medium">{copied ? 'Copied!' : 'Copy Profile Link'}</div>
                    <div className="text-gray-400 text-xs">Share your profile URL</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
