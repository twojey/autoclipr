import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VideoEditor } from './components/VideoEditor/VideoEditor';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-light-background-primary dark:bg-dark-background-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<VideoEditor />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
