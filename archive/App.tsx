import React from 'react';
import VideoEditor from './compositions/VideoEditor';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Autoclipr Video Editor</h1>
        <VideoEditor />
      </div>
    </div>
  );
}

export default App;
