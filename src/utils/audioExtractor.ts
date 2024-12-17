// @ts-check
export interface AudioExtractionProgress {
  status: 'extracting' | 'done' | 'error';
  progress: number;
}

export class AudioExtractor {
  private audioContext: AudioContext | null = null;

  async extractAudio(
    videoFile: File,
    onProgress?: (progress: AudioExtractionProgress) => void
  ): Promise<Blob> {
    let videoUrl: string | null = null;
    const video = document.createElement('video');
    const chunks: Blob[] = [];

    try {
      console.log('[AudioExtractor] Début de l\'extraction audio');
      onProgress?.({ status: 'extracting', progress: 0 });

      // 1. Préparation de la vidéo
      videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;
      video.muted = true;

      // 2. Chargement des métadonnées
      await new Promise<void>((resolve, reject) => {
        const handleLoad = () => resolve();
        const handleError = () => reject(new Error('Erreur lors du chargement de la vidéo'));
        
        video.addEventListener('loadedmetadata', handleLoad);
        video.addEventListener('error', handleError);
        
        video.load();
        
        // Cleanup des événements
        video.addEventListener('loadedmetadata', () => {
          video.removeEventListener('loadedmetadata', handleLoad);
          video.removeEventListener('error', handleError);
        }, { once: true });
      });

      // 3. Configuration de l'audio
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaElementSource(video);
      const destination = this.audioContext.createMediaStreamDestination();
      source.connect(destination);

      // 4. Configuration du MediaRecorder avec des options optimales
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      // 5. Gestion des chunks audio
      mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('[AudioExtractor] Chunk audio reçu:', event.data.size, 'bytes');
        }
      });

      // 6. Attendre que la vidéo soit prête
      await new Promise<void>((resolve) => {
        const handleCanPlay = () => {
          video.removeEventListener('canplay', handleCanPlay);
          resolve();
        };
        video.addEventListener('canplay', handleCanPlay);
      });

      // 7. Extraction synchronisée
      return await new Promise<Blob>(async (resolve, reject) => {
        try {
          // Gestion de la progression
          const handleTimeUpdate = () => {
            const progress = (video.currentTime / video.duration) * 100;
            onProgress?.({ 
              status: 'extracting', 
              progress: Math.min(Math.round(progress), 100) 
            });
          };
          video.addEventListener('timeupdate', handleTimeUpdate);

          // Gestion de la fin
          const handleEnded = async () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            
            console.log('[AudioExtractor] Vidéo terminée, attente des derniers chunks...');
            await new Promise(r => setTimeout(r, Math.ceil(video.duration * 50)));
            
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              console.log('[AudioExtractor] Enregistrement arrêté');
            }
          };
          video.addEventListener('ended', handleEnded);

          // Gestion de l'arrêt de l'enregistrement
          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(chunks, { 
              type: 'audio/webm;codecs=opus'
            });
            console.log('[AudioExtractor] Blob audio créé:', audioBlob.size, 'bytes');
            onProgress?.({ status: 'done', progress: 100 });
            resolve(audioBlob);
          });

          // Démarrage synchronisé
          video.currentTime = 0;
          mediaRecorder.start(100);
          await video.play();
          console.log('[AudioExtractor] Lecture et enregistrement démarrés');

        } catch (error) {
          console.error('[AudioExtractor] Erreur pendant l\'extraction:', error);
          onProgress?.({ status: 'error', progress: 0 });
          reject(error);
        }
      });

    } catch (error) {
      console.error('[AudioExtractor] Erreur:', error);
      onProgress?.({ status: 'error', progress: 0 });
      throw error;

    } finally {
      // Nettoyage complet des ressources
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        console.log('[AudioExtractor] URL de la vidéo libérée');
      }
      
      if (this.audioContext) {
        try {
          await this.audioContext.close();
          console.log('[AudioExtractor] Contexte audio fermé');
        } catch (e) {
          console.warn('[AudioExtractor] Erreur lors de la fermeture du contexte audio:', e);
        }
        this.audioContext = null;
      }

      video.remove();
      console.log('[AudioExtractor] Élément vidéo supprimé');
    }
  }
}
