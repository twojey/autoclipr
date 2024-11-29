import '../remotion.config';

const FPS = 30;

/**
 * Exporte une vidéo en utilisant l'API MediaRecorder.
 * @param {string} videoFile - URL de la vidéo source
 * @param {number} startTime - Temps de début du clip en secondes
 * @param {number} endTime - Temps de fin du clip en secondes
 * @param {string} quality - Qualité d'export ('standard', 'hd', 'max')
 * @param {Function} onProgress - Callback pour la progression
 * @returns {Promise<Blob>} - Blob de la vidéo exportée
 */
export const exportVideo = async (videoFile, startTime, endTime, quality, onProgress) => {
  try {
    // Création d'un élément vidéo source
    const sourceVideo = document.createElement('video');
    sourceVideo.src = videoFile;
    await new Promise((resolve) => {
      sourceVideo.onloadedmetadata = resolve;
    });

    // Configuration de la qualité
    let resolution;
    switch (quality) {
      case 'hd':
        resolution = { width: 1920, height: 1080 };
        break;
      case 'max':
        resolution = { width: 2560, height: 1440 };
        break;
      default:
        resolution = { width: 1280, height: 720 };
    }

    // Création du canvas pour le rendu
    const canvas = document.createElement('canvas');
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    const ctx = canvas.getContext('2d');

    // Configuration du MediaRecorder
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=h264',
      videoBitsPerSecond: 8000000, // 8 Mbps
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    // Promesse pour l'export complet
    const exportPromise = new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      mediaRecorder.onerror = reject;
    });

    // Démarrage de l'enregistrement
    mediaRecorder.start();

    // Lecture et rendu de la vidéo
    sourceVideo.currentTime = startTime;
    const duration = endTime - startTime;
    let currentTime = 0;

    const renderFrame = () => {
      if (currentTime >= duration) {
        mediaRecorder.stop();
        return;
      }

      ctx.drawImage(sourceVideo, 0, 0, resolution.width, resolution.height);
      currentTime += 1/30; // 30 FPS
      sourceVideo.currentTime = startTime + currentTime;

      if (onProgress) {
        onProgress(Math.round((currentTime / duration) * 100));
      }

      requestAnimationFrame(renderFrame);
    };

    sourceVideo.onseeked = renderFrame;
    
    return await exportPromise;
  } catch (error) {
    console.error('Erreur lors de l\'export :', error);
    throw error;
  }
};
