import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/942a5ae8-f522-4037-852f-a615b338d982';

type User = {
  username: string;
  password: string;
  balance: number;
  banned?: boolean;
  luckyMode?: boolean;
};

type Bet = {
  id: string;
  creator: string;
  amount: number;
};

type Transaction = {
  type: string;
  amount: number;
  timestamp: number;
};

export default function Index() {
  const [screen, setScreen] = useState<'welcome' | 'role' | 'auth' | 'player' | 'admin'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [betAmount, setBetAmount] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);
  const [showWallChoice, setShowWallChoice] = useState(false);
  const [playerBetAmount, setPlayerBetAmount] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminCommand, setAdminCommand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authorCode, setAuthorCode] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [luckyMode, setLuckyMode] = useState(false);
  const { toast } = useToast();

  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const loseSound = useRef<HTMLAudioElement | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('unknown'));

    spinSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIF2S57OylUBIORKXi8bllHQU2jdXywn0pBSh+zPLaizsKFlm16ey0YBoGPJHX8sd5KwUme8rx3I9ACRRfsery7pZSEQxGoud0t2QdBTWN1vLCfSgEKH3M8tmKOwkWWLPp66xeFQtJoOLyu28hBSuBzvDaijcIF2W57OukTxELQ6Tj8bplHAU2jNXyw34pBSh+zPLYizoKFlm16+u1YRsGPJHX8sd5KwUme8rx3I9ACRRfsery7pZSEQxFoud0t2QdBTWN1vLCfSgEKH3M8tiLOwkWWLPp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKTj8blmHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLCfSgEKH3M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLCfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLBfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLBfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLBfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLBfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLBfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx3I5ACRVesery7pZSEQxFoud0t2QdBTWN1vLBfSgEJ33M8tiLOwkWV7Pp66xeFQtJoOPyu28hBSuBzvDaijcIF2W47OukTxELRKPj8bplHAU1jNbywn0oBSh+y/LYizoKFlm16+u1YRoGPZDX8sd5KwUme8rx');
    winSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIF2S57OylUBIORKXi8bllHQU2jdXywn0pBSh+zPLaizsKFlm16ey0YBoGPJHX8sd5KwUme8rx3I9ACRRfsery');
    loseSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA');
    clickSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2E');
  }, []);

  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}?action=users`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBets = async () => {
    try {
      const res = await fetch(`${API_URL}?action=bets`);
      const data = await res.json();
      setBets(data.bets || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  const fetchTransactions = async (user: string) => {
    try {
      const res = await fetch(`${API_URL}?action=transactions&username=${user}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (screen === 'admin') {
      fetchUsers();
    }
    if (screen === 'player') {
      fetchBets();
      const interval = setInterval(fetchBets, 3000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const handleRegister = async () => {
    playSound(clickSound.current);
    if (!username || !password || !passwordConfirm) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    if (password !== passwordConfirm) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, password, ip: ipAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Успех! 🎉', description: 'Регистрация завершена! Получено 10 золота' });
        playSound(winSound.current);
        setAuthMode('login');
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
        playSound(loseSound.current);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка сервера', variant: 'destructive' });
    }
  };

  const handleLogin = async () => {
    playSound(clickSound.current);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser({ username, password, balance: data.balance, luckyMode: data.luckyMode });
        setLuckyMode(data.luckyMode);
        setScreen('player');
        fetchTransactions(username);
        playSound(winSound.current);
        toast({ title: 'Добро пожаловать! 🎰', description: `Привет, ${username}!` });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
        playSound(loseSound.current);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка сервера', variant: 'destructive' });
    }
  };

  const handleAdminLogin = () => {
    playSound(clickSound.current);
    if (adminCode === 'DJJDIDHDHXIEU') {
      setScreen('admin');
      fetchUsers();
      playSound(winSound.current);
      toast({ title: 'Админ панель 🔐', description: 'Доступ разрешён' });
    } else {
      toast({ title: 'Ошибка', description: 'Неверный код админа', variant: 'destructive' });
      playSound(loseSound.current);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!currentUser) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_balance', username: currentUser.username, balance: newBalance }),
      });
      setCurrentUser({ ...currentUser, balance: newBalance });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const addTransaction = async (type: string, amount: number) => {
    if (!currentUser) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_transaction', username: currentUser.username, type, amount }),
      });
      fetchTransactions(currentUser.username);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const spinRoulette = () => {
    if (!currentUser) return;
    const amount = parseInt(betAmount);
    if (!amount || amount < 10) {
      toast({ title: 'Ошибка', description: 'Минимальная ставка 10 золота', variant: 'destructive' });
      playSound(loseSound.current);
      return;
    }
    if (amount > currentUser.balance) {
      toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' });
      playSound(loseSound.current);
      return;
    }

    setSpinning(true);
    setRouletteResult(null);
    playSound(spinSound.current);

    setTimeout(() => {
      let result: string;
      let multiplier = 0;

      if (luckyMode) {
        const rand = Math.random() * 100;
        if (rand < 20) {
          result = 'X?';
          setShowWallChoice(true);
        } else if (rand < 60) {
          result = 'X2';
          multiplier = 1;
        } else {
          result = 'X1';
          multiplier = 0;
        }
      } else {
        const rand = Math.random() * 100;
        if (rand < 80) {
          result = 'ПРОИГРЫШ';
          multiplier = -1;
        } else if (rand < 98) {
          result = 'X1';
          multiplier = 0;
        } else if (rand < 99) {
          result = 'X2';
          multiplier = 1;
        } else {
          result = 'X?';
          setShowWallChoice(true);
        }
      }

      setRouletteResult(result);
      setSpinning(false);

      if (result !== 'X?') {
        const newBalance = currentUser.balance + amount * multiplier;
        updateBalance(newBalance);
        addTransaction(`Рулетка ${result}`, amount * multiplier);
        if (multiplier > 0) {
          playSound(winSound.current);
          toast({ title: '🎉 ВЫИГРЫШ!', description: `+${amount * multiplier} золота!` });
        } else if (multiplier < 0) {
          playSound(loseSound.current);
          toast({ title: '😔 Проигрыш', description: `-${amount} золота` });
        } else {
          playSound(clickSound.current);
        }
      }
    }, 3000);
  };

  const handleWallChoice = (wall: number) => {
    if (!currentUser) return;
    playSound(clickSound.current);
    const amount = parseInt(betAmount);
    const walls = [2, 5, 20].sort(() => Math.random() - 0.5);
    const multiplier = walls[wall - 1];
    const winAmount = amount * multiplier;
    updateBalance(currentUser.balance + winAmount);
    addTransaction(`X? - Стена ${wall} (X${multiplier})`, winAmount);
    playSound(winSound.current);
    toast({ title: `🎰 Стена ${wall}!`, description: `Выигрыш: +${winAmount} золота (X${multiplier})` });
    setShowWallChoice(false);
  };

  const createPlayerBet = async () => {
    if (!currentUser) return;
    playSound(clickSound.current);
    const amount = parseInt(playerBetAmount);
    if (!amount || amount < 10) {
      toast({ title: 'Ошибка', description: 'Минимальная ставка 10 золота', variant: 'destructive' });
      return;
    }
    if (amount > currentUser.balance) {
      toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' });
      return;
    }

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_bet', creator: currentUser.username, amount }),
      });
      updateBalance(currentUser.balance - amount);
      addTransaction('Ставка создана', -amount);
      fetchBets();
      toast({ title: 'Ставка создана! 💰', description: `${amount} золота` });
      setPlayerBetAmount('');
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка сервера', variant: 'destructive' });
    }
  };

  const acceptPlayerBet = async (bet: Bet) => {
    if (!currentUser || bet.creator === currentUser.username) return;
    playSound(clickSound.current);
    if (bet.amount > currentUser.balance) {
      toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' });
      return;
    }

    const totalPot = bet.amount * 2;
    const rand = Math.random() * totalPot;
    const winner = rand < bet.amount ? bet.creator : currentUser.username;
    const loser = winner === bet.creator ? currentUser.username : bet.creator;

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_bet', bet_id: bet.id, winner, loser, amount: bet.amount }),
      });

      if (winner === currentUser.username) {
        updateBalance(currentUser.balance + bet.amount);
        addTransaction('Ставка выиграна', bet.amount);
        playSound(winSound.current);
        toast({ title: '🎉 ВЫИГРЫШ!', description: `Вы выиграли ${bet.amount} золота!` });
      } else {
        updateBalance(currentUser.balance - bet.amount);
        addTransaction('Ставка проиграна', -bet.amount);
        playSound(loseSound.current);
        toast({ title: '😔 Проигрыш', description: `Вы проиграли ${bet.amount} золота` });
      }
      fetchBets();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка сервера', variant: 'destructive' });
    }
  };

  const executeAdminCommand = async () => {
    playSound(clickSound.current);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_command', command: adminCommand }),
      });
      if (res.ok) {
        playSound(winSound.current);
        toast({ title: 'Команда выполнена ✅', description: adminCommand });
        fetchUsers();
      } else {
        const data = await res.json();
        playSound(loseSound.current);
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
      setAdminCommand('');
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка сервера', variant: 'destructive' });
    }
  };

  const activateCode = async () => {
    if (!currentUser) return;
    playSound(clickSound.current);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_code', username: currentUser.username, code: authorCode }),
      });
      const data = await res.json();
      if (res.ok) {
        playSound(winSound.current);
        if (data.type === 'balance') {
          updateBalance(currentUser.balance + data.amount);
          toast({ title: '🎁 Код активирован!', description: `+${data.amount} золота!` });
        } else if (data.type === 'lucky') {
          setLuckyMode(true);
          toast({ title: '🍀 МЕГА УДАЧА!', description: 'Режим мега-удачи активирован!' });
        }
        setAuthorCode('');
        fetchTransactions(currentUser.username);
      } else {
        playSound(loseSound.current);
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка сервера', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black via-black-light to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gold rounded-full blur-3xl animate-pulse-gold"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-dark rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="text-center animate-fade-in relative z-10">
          <img 
            src="https://cdn.poehali.dev/files/IMG_20251211_090149_853.png" 
            alt="F12F13 Casino" 
            className="w-48 h-48 mx-auto mb-8 animate-scale-in gold-border-glow rounded-2xl"
          />
          <h1 className="text-7xl font-black text-gold gold-glow mb-6 tracking-wider">F12F13 CASINO</h1>
          <div className="bg-black-light/50 backdrop-blur-sm p-6 rounded-xl border-2 border-gold/30 mb-8">
            <p className="text-2xl text-gold-light mb-2">Для использования</p>
            <p className="text-xl text-gold">подпишитесь на телеграмм канал</p>
          </div>
          <Button
            onClick={() => {
              playSound(clickSound.current);
              window.open('https://t.me/f12f12f12f12f12f12f12', '_blank');
              setScreen('role');
            }}
            className="bg-gold hover:bg-gold-dark text-black font-black text-xl px-12 py-8 gold-border-glow transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <Icon name="Send" className="mr-3" size={28} />
            ПОДПИСАТЬСЯ И ПРОДОЛЖИТЬ
          </Button>
        </div>
      </div>
    );
  }

  if (screen === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black via-black-light to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gold rounded-full blur-3xl animate-pulse-gold"></div>
        </div>
        <div className="animate-scale-in space-y-6 w-full max-w-md relative z-10">
          <img 
            src="https://cdn.poehali.dev/files/IMG_20251211_090149_853.png" 
            alt="Logo" 
            className="w-32 h-32 mx-auto mb-4 gold-border-glow rounded-xl"
          />
          <h2 className="text-5xl font-black text-gold gold-glow text-center mb-12">Выберите роль</h2>
          <Button
            onClick={() => {
              playSound(clickSound.current);
              setScreen('auth');
            }}
            className="w-full bg-gold hover:bg-gold-dark text-black font-black text-2xl py-12 gold-border-glow transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <Icon name="User" className="mr-3" size={32} />
            Я ИГРОК
          </Button>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="🔐 Код администратора"
              value={adminCode}
              onChange={e => setAdminCode(e.target.value)}
              className="bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
            />
            <Button 
              onClick={handleAdminLogin} 
              className="w-full bg-secondary/80 backdrop-blur hover:bg-muted text-gold font-bold text-xl py-8 border-2 border-gold/30 hover:border-gold transition-all"
            >
              <Icon name="Shield" className="mr-3" size={24} />
              Я АДМИН
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-black via-black-light to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gold rounded-full blur-3xl animate-pulse-gold"></div>
        </div>
        <Card className="w-full max-w-md p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow animate-fade-in relative z-10 shadow-2xl">
          <img 
            src="https://cdn.poehali.dev/files/IMG_20251211_090149_853.png" 
            alt="Logo" 
            className="w-24 h-24 mx-auto mb-6 gold-border-glow rounded-xl"
          />
          <h2 className="text-4xl font-black text-gold gold-glow text-center mb-8">
            {authMode === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
          </h2>
          <div className="space-y-5">
            <Input
              placeholder="👤 Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
            />
            <Input
              type="password"
              placeholder="🔒 Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
            />
            {authMode === 'register' && (
              <Input
                type="password"
                placeholder="🔒 Повторите пароль"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
              />
            )}
            <Button
              onClick={authMode === 'login' ? handleLogin : handleRegister}
              className="w-full bg-gold hover:bg-gold-dark text-black font-black text-xl py-8 transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              {authMode === 'login' ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </Button>
            <Button
              onClick={() => {
                playSound(clickSound.current);
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
              variant="ghost"
              className="w-full text-gold-light hover:text-gold text-lg transition-all"
            >
              {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (screen === 'player' && currentUser) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-black via-black-light to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gold rounded-full blur-3xl animate-pulse-gold"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-dark rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8 bg-black-light/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-gold/30">
            <div className="flex items-center gap-4">
              <img 
                src="https://cdn.poehali.dev/files/IMG_20251211_090149_853.png" 
                alt="Logo" 
                className="w-16 h-16 gold-border-glow rounded-xl"
              />
              <h1 className="text-5xl font-black text-gold gold-glow tracking-wider">F12F13 CASINO</h1>
            </div>
            <div className="flex items-center gap-6">
              {luckyMode && (
                <div className="bg-gold/20 px-6 py-3 rounded-xl border-2 border-gold animate-pulse-gold">
                  <p className="text-gold font-black text-lg">🍀 МЕГА УДАЧА</p>
                </div>
              )}
              <div className="text-right bg-gradient-to-r from-gold/10 to-gold/20 px-8 py-4 rounded-xl border-2 border-gold/50">
                <p className="text-gold-light text-sm mb-1">Баланс</p>
                <p className="text-4xl font-black text-gold animate-pulse-gold">{currentUser.balance} 💰</p>
              </div>
              <Button
                onClick={() => {
                  playSound(clickSound.current);
                  setCurrentUser(null);
                  setScreen('role');
                }}
                variant="ghost"
                className="text-gold-light hover:text-gold transform hover:scale-110 transition-all"
              >
                <Icon name="LogOut" size={28} />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="roulette" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-secondary/80 backdrop-blur-sm p-2 rounded-2xl border-2 border-gold/30">
              <TabsTrigger value="roulette" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold text-lg py-4 rounded-xl transition-all">
                🎰 Рулетка
              </TabsTrigger>
              <TabsTrigger value="bets" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold text-lg py-4 rounded-xl transition-all">
                💰 Ставки
              </TabsTrigger>
              <TabsTrigger value="shop" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold text-lg py-4 rounded-xl transition-all">
                🏪 Магазин
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roulette" className="space-y-6">
              <Card className="p-12 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
                <h2 className="text-4xl font-black text-gold mb-10 text-center gold-glow">🎰 РУЛЕТКА КАЗИНО</h2>
                <div className="flex flex-col items-center gap-8">
                  <div
                    className={`w-80 h-80 rounded-full border-8 border-gold flex items-center justify-center text-6xl font-black ${
                      spinning ? 'animate-spin-slow' : ''
                    } ${rouletteResult === 'X2' || rouletteResult === 'X?' ? 'text-gold' : 'text-gold-light'} gold-border-glow shadow-2xl bg-gradient-to-br from-black-light to-black`}
                  >
                    {spinning ? '🎰' : rouletteResult || '???'}
                  </div>
                  <Input
                    type="number"
                    placeholder="💰 Ставка (мин. 10)"
                    value={betAmount}
                    onChange={e => setBetAmount(e.target.value)}
                    disabled={spinning}
                    className="max-w-md bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-xl py-8 text-center font-bold focus:border-gold transition-all"
                  />
                  <Button
                    onClick={spinRoulette}
                    disabled={spinning}
                    className="bg-gold hover:bg-gold-dark text-black font-black px-16 py-10 text-2xl transform hover:scale-110 transition-all duration-300 shadow-2xl disabled:opacity-50"
                  >
                    {spinning ? '⚡ КРУТИТСЯ...' : '🎰 КРУТИТЬ РУЛЕТКУ'}
                  </Button>
                  <div className="text-center text-gold-light text-lg font-semibold bg-black-light/50 px-8 py-4 rounded-xl border border-gold/30">
                    <p>Шансы: ???</p>
                  </div>
                </div>
              </Card>

              {showWallChoice && (
                <Card className="p-12 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow animate-scale-in shadow-2xl">
                  <h3 className="text-4xl font-black text-gold mb-10 text-center gold-glow">🎯 ВЫБЕРИТЕ СТЕНУ!</h3>
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map(wall => (
                      <Button
                        key={wall}
                        onClick={() => handleWallChoice(wall)}
                        className="bg-gold hover:bg-gold-dark text-black font-black py-20 text-4xl transform hover:scale-110 transition-all duration-300 shadow-2xl"
                      >
                        🧱 {wall}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-gold-light mt-8 text-xl font-semibold">За стенами: X2, X5, X20</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bets" className="space-y-6">
              <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
                <h2 className="text-3xl font-black text-gold mb-6 gold-glow">💰 Создать ставку</h2>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="💰 Сумма (мин. 10)"
                    value={playerBetAmount}
                    onChange={e => setPlayerBetAmount(e.target.value)}
                    className="bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
                  />
                  <Button onClick={createPlayerBet} className="bg-gold hover:bg-gold-dark text-black font-black px-10 text-xl transform hover:scale-105 transition-all">
                    Создать
                  </Button>
                </div>
              </Card>

              <div className="grid gap-6">
                {bets.map(bet => (
                  <Card key={bet.id} className="p-8 bg-card/90 backdrop-blur-xl border-2 border-gold/50 animate-fade-in hover:border-gold transition-all shadow-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gold font-black text-2xl">{bet.creator}</p>
                        <p className="text-gold-light text-lg">Ставка: {bet.amount} золота</p>
                      </div>
                      {bet.creator !== currentUser.username && (
                        <Button
                          onClick={() => acceptPlayerBet(bet)}
                          className="bg-gold hover:bg-gold-dark text-black font-black px-8 py-6 text-xl transform hover:scale-110 transition-all"
                        >
                          ⚡ Принять
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                {bets.length === 0 && (
                  <p className="text-center text-gold-light text-2xl py-20 bg-black-light/50 rounded-2xl border-2 border-gold/30">
                    Нет активных ставок
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shop" className="space-y-6">
              <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
                <h2 className="text-3xl font-black text-gold mb-6 gold-glow">💳 Пополнить баланс</h2>
                <p className="text-gold-light text-lg mb-6">
                  Купите скин у администратора за нужное количество золота
                </p>
                <Button
                  onClick={() => {
                    playSound(clickSound.current);
                    window.open('https://t.me/Aks1kx_bot', '_blank');
                  }}
                  className="w-full bg-gold hover:bg-gold-dark text-black font-black py-8 text-xl transform hover:scale-105 transition-all shadow-xl"
                >
                  <Icon name="MessageCircle" className="mr-3" size={24} />
                  ПЕРЕЙТИ В ЧАТ К АДМИНУ
                </Button>
              </Card>

              <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
                <h2 className="text-3xl font-black text-gold mb-6 gold-glow">💸 Вывод средств</h2>
                <p className="text-gold-light text-lg mb-6">Минимальная сумма вывода: 200 золота</p>
                <Button
                  onClick={() => {
                    playSound(clickSound.current);
                    if (currentUser.balance >= 200) {
                      window.open('https://t.me/Aks1kx_bot', '_blank');
                    } else {
                      toast({ title: 'Ошибка', description: 'Недостаточно средств для вывода', variant: 'destructive' });
                      playSound(loseSound.current);
                    }
                  }}
                  disabled={currentUser.balance < 200}
                  className="w-full bg-gold hover:bg-gold-dark text-black font-black py-8 text-xl transform hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  ВЫВЕСТИ СРЕДСТВА
                </Button>
              </Card>

              <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
                <h2 className="text-3xl font-black text-gold mb-6 gold-glow">🎁 Поддержать автора</h2>
                <Input
                  placeholder="🎫 Введите промокод"
                  value={authorCode}
                  onChange={e => setAuthorCode(e.target.value)}
                  className="mb-4 bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
                />
                <Button onClick={activateCode} className="w-full bg-secondary/80 backdrop-blur hover:bg-muted text-gold font-black py-8 text-xl border-2 border-gold/30 hover:border-gold transition-all">
                  ПРИМЕНИТЬ КОД
                </Button>
              </Card>

              <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
                <h2 className="text-3xl font-black text-gold mb-6 gold-glow">📜 История транзакций</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {transactions.map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-secondary/80 backdrop-blur rounded-xl border border-gold/30 hover:border-gold transition-all">
                      <span className="text-gold-light font-semibold text-lg">{t.type}</span>
                      <span className={`font-black text-2xl ${t.amount >= 0 ? 'text-gold' : 'text-destructive'}`}>
                        {t.amount >= 0 ? '+' : ''}
                        {t.amount} 💰
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-gold-light text-xl py-20">Нет транзакций</p>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (screen === 'admin') {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-black via-black-light to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gold rounded-full blur-3xl animate-pulse-gold"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8 bg-black-light/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-gold/30">
            <div className="flex items-center gap-4">
              <img 
                src="https://cdn.poehali.dev/files/IMG_20251211_090149_853.png" 
                alt="Logo" 
                className="w-16 h-16 gold-border-glow rounded-xl"
              />
              <h1 className="text-5xl font-black text-gold gold-glow">🔐 АДМИН ПАНЕЛЬ</h1>
            </div>
            <Button 
              onClick={() => {
                playSound(clickSound.current);
                setScreen('role');
              }} 
              variant="ghost" 
              className="text-gold-light hover:text-gold transform hover:scale-110 transition-all"
            >
              <Icon name="LogOut" size={28} />
            </Button>
          </div>

          <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow mb-8 shadow-2xl">
            <h2 className="text-3xl font-black text-gold mb-6 gold-glow">⚡ Консоль команд</h2>
            <div className="space-y-3 mb-6">
              <p className="text-gold-light text-sm"><code className="bg-black-light px-2 py-1 rounded">/п [username] +100</code> - добавить/отнять баланс</p>
              <p className="text-gold-light text-sm"><code className="bg-black-light px-2 py-1 rounded">/б [username]</code> - забанить игрока</p>
              <p className="text-gold-light text-sm"><code className="bg-black-light px-2 py-1 rounded">/к [код] [кол-во] +100</code> - промокод на баланс</p>
              <p className="text-gold-light text-sm"><code className="bg-black-light px-2 py-1 rounded">/у [код] [кол-во]</code> - промокод мега-удачи</p>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Введите команду..."
                value={adminCommand}
                onChange={e => setAdminCommand(e.target.value)}
                className="bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
              />
              <Button onClick={executeAdminCommand} className="bg-gold hover:bg-gold-dark text-black font-black px-10 text-xl transform hover:scale-105 transition-all">
                Выполнить
              </Button>
            </div>
          </Card>

          <Card className="p-10 bg-card/90 backdrop-blur-xl border-2 border-gold gold-border-glow shadow-2xl">
            <h2 className="text-3xl font-black text-gold mb-6 gold-glow">👥 Пользователи</h2>
            <Input
              placeholder="🔍 Поиск пользователя..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mb-6 bg-secondary/80 backdrop-blur border-2 border-gold/50 text-gold-light text-lg py-6 focus:border-gold transition-all"
            />
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredUsers.map(user => (
                <div key={user.username} className="p-6 bg-secondary/80 backdrop-blur rounded-xl flex justify-between items-center border-2 border-gold/30 hover:border-gold transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-gold font-black text-2xl">{user.username}</p>
                      {user.banned && (
                        <span className="bg-destructive/20 text-destructive px-3 py-1 rounded-lg text-sm font-bold border border-destructive">
                          ЗАБАНЕН
                        </span>
                      )}
                      {user.luckyMode && (
                        <span className="bg-gold/20 text-gold px-3 py-1 rounded-lg text-sm font-bold border border-gold">
                          🍀 УДАЧА
                        </span>
                      )}
                    </div>
                    <p className="text-gold-light text-sm">Пароль: <code className="bg-black-light px-2 py-1 rounded">{user.password}</code></p>
                  </div>
                  <p className="text-gold text-3xl font-black">{user.balance} 💰</p>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-gold-light text-2xl py-20">Пользователи не найдены</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
