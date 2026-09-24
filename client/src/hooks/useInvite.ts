import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService } from '../services/invite.service.js';

export const useInviteDetails = (inviteCode?: string) => {
  return useQuery({
    queryKey: ['invite', inviteCode],
    queryFn: () => inviteService.getInviteByCode(inviteCode!),
    enabled: Boolean(inviteCode),
    retry: 1,
  });
};

export const useTrackInviteClick = () => {
  return useMutation({
    mutationFn: (inviteCode: string) => inviteService.trackClick(inviteCode),
  });
};

export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => inviteService.createInvite(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export const useFriendsAttending = (eventId: string) => {
  return useQuery({
    queryKey: ['friends-attending', eventId],
    queryFn: () => inviteService.getFriendsAttending(eventId),
    enabled: Boolean(eventId),
    staleTime: 1000 * 60 * 2,
  });
};
