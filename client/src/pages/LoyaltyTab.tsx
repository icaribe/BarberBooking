import { useState } from 'react';
import { Award, Scissors, Percent, Beer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLoyalty } from '@/lib/hooks/useLoyalty';
import type { LoyaltyReward } from '@/lib/types';

const LoyaltyTab = () => {
  const { toast } = useToast();
  // Using a fixed user ID (1) for demo purposes
  const { rewards, loyaltyPoints, isLoadingRewards, isLoadingUser, redeemReward, isRedeeming } = useLoyalty(1);
  
  const handleRedeemReward = async (reward: LoyaltyReward) => {
    if (loyaltyPoints < reward.pointsCost) {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de mais ${reward.pointsCost - loyaltyPoints} pontos para trocar por esta recompensa.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      await redeemReward({ userId: 1, rewardId: reward.id });
      toast({
        title: "Recompensa resgatada!",
        description: `Você trocou ${reward.pointsCost} pontos por "${reward.name}".`,
      });
    } catch (error) {
      toast({
        title: "Erro ao resgatar",
        description: "Ocorreu um erro ao tentar resgatar a recompensa. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate progress to next level (200 points)
  const progressPercent = Math.min(Math.floor((loyaltyPoints / 200) * 100), 100);
  const pointsToNextLevel = 200 - (loyaltyPoints % 200);
  
  if (isLoadingRewards || isLoadingUser) {
    return (
      <div className="px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const renderRewardIcon = (icon: string | null) => {
    switch (icon) {
      case 'cut':
        return <Scissors className="text-secondary-foreground" />;
      case 'percentage':
        return <Percent className="text-secondary-foreground" />;
      case 'beer':
        return <Beer className="text-secondary-foreground" />;
      default:
        return <Award className="text-secondary-foreground" />;
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="bg-card rounded-lg p-5 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
          <Award className="text-primary-foreground text-4xl" />
        </div>
        <h2 className="font-montserrat font-bold text-xl mb-2">Programa de Fidelidade</h2>
        <p className="text-muted-foreground mb-6">
          Ganhe pontos a cada serviço e troque por descontos e brindes exclusivos.
        </p>
        
        <div className="bg-secondary rounded-lg p-4 mb-6">
          <h3 className="font-montserrat font-semibold text-lg mb-2">Seus Pontos</h3>
          <div className="text-4xl font-bold text-primary mb-2">{loyaltyPoints}</div>
          <p className="text-muted-foreground text-sm">Próximo nível: {pointsToNextLevel} pontos</p>
          
          <Progress value={progressPercent} className="h-2 mt-3" />
        </div>
        
        <h3 className="font-montserrat font-semibold text-lg mb-3">Vantagens para Trocar</h3>
        
        {rewards.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhuma recompensa disponível no momento
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(reward => (
              <div key={reward.id} className="bg-secondary rounded-lg p-3 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
                  {renderRewardIcon(reward.icon)}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium">{reward.name}</h4>
                  <p className="text-muted-foreground text-xs">{reward.pointsCost} pontos</p>
                </div>
                <Button 
                  variant={loyaltyPoints >= reward.pointsCost ? "default" : "secondary"}
                  className={loyaltyPoints >= reward.pointsCost 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"}
                  size="sm"
                  onClick={() => handleRedeemReward(reward)}
                  disabled={loyaltyPoints < reward.pointsCost || isRedeeming}
                >
                  Trocar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyTab;
