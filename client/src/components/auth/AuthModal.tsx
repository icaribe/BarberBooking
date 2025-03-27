import { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthView = 'login' | 'register';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>('login');

  const handleAuthSuccess = () => {
    onAuthSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 bg-background">
        {view === 'login' ? (
          <LoginForm 
            onSuccess={handleAuthSuccess} 
            onRegisterClick={() => setView('register')}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess} 
            onLoginClick={() => setView('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;