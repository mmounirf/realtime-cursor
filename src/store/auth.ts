import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";
import type { Database } from "@/database.types";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,

  initializeAuth: async () => {
    set({ isLoading: true });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      set({ session, user: session.user, profile, isLoading: false });
    } else {
      set({ session: null, user: null, profile: null, isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({ session, user: session.user, profile, isLoading: false });
      } else {
        set({ session: null, user: null, profile: null, isLoading: false });
      }
    });
  },

  signInAnonymously: async () => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Login failed:", error.message);
      set({ isLoading: false });
    }
  },

  updateUsername: async (newUsername: string) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name: newUsername })
      .eq("id", user.id);

    if (error) throw error;

    set((state) => ({
      profile: state.profile
        ? { ...state.profile, username: newUsername }
        : null,
    }));
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
