// composables/useNotifications.js
export const useNotifications = () => {
    const { $firebase } = useNuxtApp();
    
    const storeToken = async (token:string) => {
      const browserId = getBrowserId();
      const fingerprint = JSON.parse(localStorage.getItem('browserFingerprint') as string);
      
      try {
        await $fetch('/api/notifications/token', {
          method: 'POST',
          body: {
            browserId,
            token,
            fingerprint,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Token storage failed:', error);
      }
    };
  
    return { storeToken };
  };