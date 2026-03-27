import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import BackgroundEffects from '@/components/BackgroundEffects';

export const metadata = {
  title: 'BATTLE-FRONT // THE NEXUS',
  description: 'Where Frontend Engineering Meets Real-World Competition',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <BackgroundEffects />
        <Navbar />
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
