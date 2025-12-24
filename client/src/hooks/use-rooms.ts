import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateRoomRequest, JoinRoomRequest, RoomResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch room details
export function useRoom(code: string | undefined) {
  return useQuery({
    queryKey: [api.rooms.get.path, code],
    queryFn: async () => {
      if (!code) throw new Error("No room code provided");
      const url = buildUrl(api.rooms.get.path, { code });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch room");
      }
      return api.rooms.get.responses[200].parse(await res.json());
    },
    enabled: !!code,
    refetchInterval: 1000, // Polling fallback in case WS fails, or for initial sync
  });
}

// Create a new room
export function useCreateRoom() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateRoomRequest) => {
      const validated = api.rooms.create.input.parse(data);
      const res = await fetch(api.rooms.create.path, {
        method: api.rooms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create room");
      }
      return api.rooms.create.responses[201].parse(await res.json());
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating room",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Join an existing room
export function useJoinRoom() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: JoinRoomRequest) => {
      const validated = api.rooms.join.input.parse(data);
      const res = await fetch(api.rooms.join.path, {
        method: api.rooms.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join room");
      }
      return api.rooms.join.responses[200].parse(await res.json());
    },
    onError: (error: Error) => {
      toast({
        title: "Error joining room",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
