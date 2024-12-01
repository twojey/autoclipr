import React from 'react';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/solid';

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 
      transition-colors backdrop-blur-sm"
  >
    {children}
  </button>
);

interface CanvasControlsProps {
  onFitHeight: () => void;
  onFitWidth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
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
