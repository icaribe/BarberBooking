import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { apiRequest } from '../queryClient';
import type { LoyaltyReward, User } from '../types';

export const useLoyalty = (userId?: number) => {
  const queryClient = useQueryClient();

  // Fetch all loyalty rewards
  const { 
    data: rewards = [], 
    isLoading: isLoadingRewards,
    error: rewardsError 
  } = useQuery<LoyaltyReward[]>({ 
    queryKey: [API_ENDPOINTS.LOYALTY_REWARDS] 
  });

  // Fetch user data to get loyalty points
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError 
  } = useQuery<User>({ 
    queryKey: [`${API_ENDPOINTS.USERS}/${userId}`],
    enabled: !!userId
  });

  // Create a new loyalty reward
  const { mutateAsync: createReward, isPending: isCreatingReward } = useMutation({
    mutationFn: async (reward: Omit<LoyaltyReward, 'id'>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.LOYALTY_REWARDS, reward);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.LOYALTY_REWARDS] });
    }
  });

  // Redeem a loyalty reward (this is a mock since the API doesn't support this yet)
  const { mutateAsync: redeemReward, isPending: isRedeeming } = useMutation({
    mutationFn: async ({ userId, rewardId }: { userId: number; rewardId: number }) => {
      // In a real app, we would make an API call to redeem the reward
      // For now, let's just simulate a successful redemption
      // by updating the user's loyalty points
      if (!userId || !rewardId) throw new Error("Missing userId or rewardId");
      
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) throw new Error("Reward not found");
      
      if (!user) throw new Error("User not found");
      if (user.loyaltyPoints < reward.pointsCost) throw new Error("Not enough points");
      
      // Update user's loyalty points
      const updatedUser = { 
        ...user, 
        loyaltyPoints: user.loyaltyPoints - reward.pointsCost 
      };
      
      const response = await apiRequest('PATCH', `${API_ENDPOINTS.USERS}/${userId}`, {
        loyaltyPoints: updatedUser.loyaltyPoints
      });
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${API_ENDPOINTS.USERS}/${variables.userId}`] });
    }
  });

  return {
    rewards,
    user,
    loyaltyPoints: user?.loyaltyPoints || 0,
    isLoadingRewards,
    isLoadingUser,
    rewardsError,
    userError,
    createReward,
    redeemReward,
    isCreatingReward,
    isRedeeming
  };
};
