import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rsvpService, CreateRSVPPayload } from '../services/rsvp.service.js';
import { useAuth } from '../context/AuthContext.js';

export const useMyRSVPs = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['my-rsvps'],
    queryFn: () => rsvpService.getMyRSVPs(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateRSVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload?: CreateRSVPPayload }) =>
      rsvpService.createRSVP(eventId, payload),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to keep frontend state synchronous
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export const useCancelRSVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => rsvpService.cancelRSVP(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};
