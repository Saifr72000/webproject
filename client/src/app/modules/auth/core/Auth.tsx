// ✅ Updated Auth.tsx
import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { LayoutSplashScreen } from "../../../../_metronic/layout/core";
import { UserModel } from "./_models";
import { getUserByToken, logoutRequest } from "./_requests";
import { WithChildren } from "../../../../_metronic/helpers";
import { setupAxios } from "./AuthHelpers";
import axios from "axios";

const AuthContext = createContext({} as AuthContextProps);

type AuthContextProps = {
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  logout: () => void;
};

const useAuth = () => useContext(AuthContext);

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setCurrentUser(undefined);
    }
  };

  useEffect(() => {
    setupAxios(axios, logout);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { currentUser, setCurrentUser, logout } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    const requestUser = async () => {
      try {
        const { data } = await getUserByToken();
        setCurrentUser(data);
      } catch (error) {
        console.error("User fetch failed:", error);
        if (currentUser) {
          logout();
        }
      } finally {
        setShowSplashScreen(false);
      }
    };

    requestUser();
  }, []);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };
