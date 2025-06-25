import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const UserContext = createContext({});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener la información adicional del usuario desde la tabla users
  const getUserInfo = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  };

  // Función para login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // La información del usuario se actualizará automáticamente
      // a través del listener de onAuthStateChange
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.message || 'Error inesperado durante el login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para register
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      const userId = authData?.user?.id;

      if (userId) {
        const { error: dbError } = await supabase.from("users").insert([
          {
            id: userId,
            name: userData.name,
            email: userData.email,
            type: userData.type,
          },
        ]);

        if (dbError) {
          setError(dbError.message);
          return { success: false, error: dbError.message };
        }
      }

      return { success: true, data: authData };
    } catch (error) {
      const errorMessage = error.message || 'Error inesperado durante el registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para logout
  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Limpiar el estado local
      setUser(null);
      setUserInfo(null);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error inesperado durante el logout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para actualizar información del usuario
  const updateUserInfo = async (updates) => {
    try {
      setError(null);
      
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUserInfo(data);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar información del usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verificar si el usuario está autenticado y obtener su información
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener la sesión:', error);
          setError(error.message);
        } else if (session?.user && mounted) {
          setUser(session.user);
          // Obtener información adicional del usuario
          const info = await getUserInfo(session.user.id);
          if (mounted) {
            setUserInfo(info);
          }
        }
      } catch (error) {
        console.error('Error al obtener la sesión:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listener para cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const info = await getUserInfo(session.user.id);
          setUserInfo(info);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserInfo(null);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          // Mantener la información del usuario actualizada
          if (!userInfo) {
            const info = await getUserInfo(session.user.id);
            setUserInfo(info);
          }
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return userInfo?.type === role;
  };

  // Función para obtener el nombre completo del usuario
  const getDisplayName = () => {
    return userInfo?.name || user?.email || 'Usuario';
  };

  const value = {
    // Estado
    user,
    userInfo,
    loading,
    error,
    
    // Computed values
    isAuthenticated: !!user,
    isVentas: hasRole('VENTAS'),
    isIngeniero: hasRole('INGENIERO'),
    displayName: getDisplayName(),
    
    // Funciones
    login,
    register,
    logout,
    updateUserInfo,
    hasRole,
    
    // Limpiar errores
    clearError: () => setError(null),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};