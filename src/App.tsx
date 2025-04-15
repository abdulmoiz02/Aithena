import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
        <Sidebar />
        <main className="md:ml-64 flex-1 flex flex-col">
          <Header />
          <ChatWindow />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;