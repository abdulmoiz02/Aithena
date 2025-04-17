import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';

function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Sidebar />
        <main className="flex-1 w-full md:ml-64">
          <Header />
          <ChatWindow />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;