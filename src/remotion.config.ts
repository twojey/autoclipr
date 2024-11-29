import { Config } from 'remotion';
import { webpackOverride } from './webpack-override';

Config.Rendering.setImageFormat('jpeg');
Config.Output.setCodec('h264');
Config.Output.setPixelFormat('yuv420p');
Config.Output.setOverwriteOutput(true);

// Configuration par défaut pour le rendu vidéo
Config.Bundling.overrideWebpackConfig(webpackOverride);
