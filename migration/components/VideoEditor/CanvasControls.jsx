import React from 'react';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/solid';

const ControlButton = ({ onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 
      transition-colors backdrop-blur-sm"
  >
    {children}
  </button>
);

const CanvasControls = ({
  onFitHeight,
  onFitWidth,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="absolute bottom-4 left-4 flex gap-2">
      <ControlButton
        onClick={onFitHeight}
        title="Ajuster à la hauteur"
      >
        <ArrowsUpDownIcon className="w-6 h-6" />
      </ControlButton>

      <ControlButton
        onClick={onFitWidth}
        title="Ajuster à la largeur"
      >
        <ArrowsRightLeftIcon className="w-6 h-6" />
      </ControlButton>

      <ControlButton
        onClick={onZoomIn}
        title="Zoom avant"
      >
        <ArrowsPointingInIcon className="w-6 h-6" />
      </ControlButton>

      <ControlButton
        onClick={onZoomOut}
        title="Zoom arrière"
      >
        <ArrowsPointingOutIcon className="w-6 h-6" />
      </ControlButton>
    </div>
  );
};

export default CanvasControls;
