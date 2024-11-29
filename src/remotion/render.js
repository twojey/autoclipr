const { bundle } = require('@remotion/bundler');
const { getCompositions, renderMedia } = require('@remotion/renderer');
const path = require('path');

const start = async () => {
  // Récupérer la configuration depuis les arguments
  const config = JSON.parse(process.argv[2]);
  
  // Créer un bundle de l'application
  const bundled = await bundle(path.join(__dirname, './index.js'));

  // Récupérer la composition
  const compositions = await getCompositions(bundled);
  const composition = compositions.find((c) => c.id === config.composition);

  // Rendre la vidéo
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: `output-${Date.now()}.mp4`,
    inputProps: config.inputProps,
    durationInFrames: config.durationInFrames,
    fps: config.fps,
    width: config.width,
    height: config.height,
  });

  console.log('Rendu terminé !');
  process.exit(0);
};

start().catch(console.error);
