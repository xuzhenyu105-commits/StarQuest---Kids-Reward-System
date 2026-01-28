import React from 'react';
import { Reward } from '../types';
import { Gift, Lock } from 'lucide-react';

interface RewardShopProps {
  rewards: Reward[];
  userPoints: number;
  onRedeem: (reward: Reward) => void;
}

const RewardShop: React.FC<RewardShopProps> = ({ rewards, userPoints, onRedeem }) => {
  return (
    <div className="grid grid-cols-2 gap-4 pb-20">
      {rewards.map((reward) => {
        const canAfford = userPoints >= reward.cost;
        
        return (
          <div 
            key={reward.id}
            className={`relative flex flex-col p-4 rounded-3xl border-4 text-center transition-all ${canAfford ? 'bg-white border-yellow-400 shadow-md' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="text-4xl mb-2">{reward.icon}</div>
            <h3 className="font-bold text-gray-800 mb-1 leading-tight">{reward.title}</h3>
            <div className={`font-black text-xl mb-3 ${canAfford ? 'text-yellow-600' : 'text-gray-400'}`}>
              {reward.cost} pts
            </div>
            
            <button
              onClick={() => canAfford && onRedeem(reward)}
              disabled={!canAfford}
              className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 ${
                canAfford 
                  ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 active:scale-95 shadow-[0_4px_0_rgb(217,119,6)] active:shadow-none active:translate-y-1' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canAfford ? (
                <>
                  Get it!
                </>
              ) : (
                <>
                  <Lock size={16} /> Locked
                </>
              )}
            </button>
          </div>
        );
      })}

      <div className="col-span-2 mt-4 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 text-center">
        <Gift className="mx-auto text-blue-400 mb-2" size={32} />
        <p className="text-blue-800 font-medium">Keep doing great tasks to unlock more rewards!</p>
      </div>
    </div>
  );
};

export default RewardShop;
