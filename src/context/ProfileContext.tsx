import { createContext, useContext, useState } from "react";
import { Profile } from "../types/supabase-types.own";

interface IProfileContext {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  loading: boolean;
}

export const ProfileContext = createContext<IProfileContext | null>(null);

export const useProfileData = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileData must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};
