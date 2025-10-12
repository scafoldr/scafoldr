/**
 * Plays a notification sound to alert the user
 * @returns Promise that resolves when the sound starts playing or rejects if there's an error
 */
export const playNotificationSound = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new audio element with the notification sound
      const audio = new Audio('/sounds/notification.mp3');

      // Play the sound and handle the result
      audio
        .play()
        .then(() => resolve())
        .catch((error) => {
          console.error('Failed to play notification sound:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error creating audio element:', error);
      reject(error);
    }
  });
};
