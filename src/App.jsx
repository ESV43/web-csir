import { useState, useEffect } from 'react';
import './index.css';
import { storageService } from './services/storageService';
import { audioBeatsEngine } from './services/audioService';
import Navbar from './components/Navbar';
import AudioBeatsPlayer from './components/AudioBeatsPlayer';
import GoogleSheetsSyncModal from './components/GoogleSheetsSyncModal';
import PDFIngestionUploader from './components/PDFIngestionUploader';
import CommandCenter from './screens/CommandCenter';
import KnowledgeVault from './screens/KnowledgeVault';
import PracticeStudio from './screens/PracticeStudio';
import ExamSimulator from './screens/ExamSimulator';
import AIVibeTutor from './screens/AIVibeTutor';
import MistakeVault from './screens/MistakeVault';
import HackDrills from './screens/HackDrills';

function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [theme, setTheme] = useState('deepspace');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showIngestionModal, setShowIngestionModal] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);

  useEffect(() => {
    const savedTheme = storageService.getTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
    storageService.updateStreak();
  }, []);

  const applyTheme = (t) => {
    if (t === 'chalkboard') document.body.classList.add('theme-chalkboard');
    else document.body.classList.remove('theme-chalkboard');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'deepspace' ? 'chalkboard' : 'deepspace';
    setTheme(newTheme);
    storageService.setTheme(newTheme);
    applyTheme(newTheme);
  };

  const navigate = (screen, subtopic = null) => {
    setActiveScreen(screen);
    setSelectedSubtopic(subtopic);
    storageService.setLastViewed({ screen, subtopic, label: screen });
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <CommandCenter navigate={navigate} />;
      case 'vault':
        return <KnowledgeVault navigate={navigate} selectedSubtopic={selectedSubtopic} />;
      case 'practice':
        return <PracticeStudio />;
      case 'exam':
        return <ExamSimulator />;
      case 'tutor':
        return <AIVibeTutor />;
      case 'mistakes':
        return <MistakeVault navigate={navigate} />;
      case 'hacks':
        return <HackDrills />;
      default:
        return <CommandCenter navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar
        activeScreen={activeScreen}
        navigate={navigate}
        theme={theme}
        toggleTheme={toggleTheme}
        openSyncModal={() => setShowSyncModal(true)}
        openIngestionModal={() => setShowIngestionModal(true)}
      />
      <AudioBeatsPlayer />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto pb-8">
        {renderScreen()}
      </main>
      {showSyncModal && <GoogleSheetsSyncModal onClose={() => setShowSyncModal(false)} openIngestionModal={() => { setShowSyncModal(false); setShowIngestionModal(true); }} />}
      {showIngestionModal && <PDFIngestionUploader onClose={() => setShowIngestionModal(false)} />}
    </div>
  );
}

export default App;
