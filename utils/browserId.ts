// utils/browserId.js
export const getBrowserId = () => {
    let browserId = localStorage.getItem('browserId');
    
    if (!browserId) {
      browserId = crypto.randomUUID();
      localStorage.setItem('browserId', browserId);
      
      // Additional identification metrics
      const fingerprint = {
        userAgent: navigator.userAgent,
        screen: { 
          width: screen.width,
          height: screen.height 
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      localStorage.setItem('browserFingerprint', JSON.stringify(fingerprint));
    }
    
    return browserId;
  };