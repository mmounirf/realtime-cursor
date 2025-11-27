import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";

interface AppState {
  authLoading: boolean;

  auth: Session | null;
  initializeAuth: () => Promise<void>;
  joinRoom: (name: string) => Promise<string>;
  signOut: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  authLoading: true,
  auth: null,

  initializeAuth: async () => {
    set({ authLoading: true });
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      set({ auth: data.session, authLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        set({ auth: data.session, authLoading: false });
      } else {
        set({ auth: null, authLoading: false });
      }
    });
  },

  joinRoom: async (name: string) => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { display_name: name } },
    });

    if (error) {
      throw error;
    } else {
      set({ auth: data.session });
      const name: string = data.user?.user_metadata.display_name;
      return name;
    }
  },

  signOut: async () => {
    set({ authLoading: true });
    await supabase.auth.signOut();
    set({ auth: null, authLoading: false });
  },
}));
