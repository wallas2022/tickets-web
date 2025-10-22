import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { api } from "../api";
import type { AppNotification } from "../types/notification";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasInitialDataRef = useRef(false);
  const previousUnreadRef = useRef(0);

  const notificationsQuery = useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<AppNotification[]>("/notifications");
      return data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<AppNotification>(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<AppNotification[]>("/notifications/read-all");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  const playNotificationSound = () => {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  };

  useEffect(() => {
    if (!notificationsQuery.data) return;
    const unread = notificationsQuery.data.filter((item) => !item.readAt).length;

    if (hasInitialDataRef.current && unread > previousUnreadRef.current) {
      playNotificationSound();
    }

    previousUnreadRef.current = unread;
    hasInitialDataRef.current = true;
  }, [notificationsQuery.data]);

  return { notificationsQuery, markAsRead, markAllAsRead };
};
