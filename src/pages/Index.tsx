import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type User = {
  username: string;
  password: string;
  balance: number;
};

type Bet = {
  id: string;
  creator: string;
  amount: number;
  timestamp: number;
};

type Transaction = {
  id: string;
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
  const [wallChoice, setWallChoice] = useState<number | null>(null);
  const [showWallChoice, setShowWallChoice] = useState(false);
  const [playerBetAmount, setPlayerBetAmount] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminCommand, setAdminCommand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authorCode, setAuthorCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedUsers = localStorage.getItem('casino_users');
    const savedBets = localStorage.getItem('casino_bets');
    const savedTransactions = localStorage.getItem('casino_transactions');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedBets) setBets(JSON.parse(savedBets));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  useEffect(() => {
    localStorage.setItem('casino_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('casino_bets', JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('casino_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (type: string, amount: number) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      timestamp: Date.now(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleRegister = () => {
    if (!username || !password || !passwordConfirm) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    if (password !== passwordConfirm) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }
    if (users.find(u => u.username === username)) {
      toast({ title: 'Ошибка', description: 'Пользователь уже существует', variant: 'destructive' });
      return;
    }
    const newUser: User = { username, password, balance: 0 };
    setUsers([...users, newUser]);
    toast({ title: 'Успех', description: 'Регистрация завершена' });
    setAuthMode('login');
  };

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      toast({ title: 'Ошибка', description: 'Неверный логин или пароль', variant: 'destructive' });
      return;
    }
    setCurrentUser(user);
    setScreen('player');
    toast({ title: 'Добро пожаловать', description: `Привет, ${username}!` });
  };

  const handleAdminLogin = () => {
    if (adminCode === 'DJJDIDHDHXIEU') {
      setScreen('admin');
      toast({ title: 'Админ панель', description: 'Доступ разрешён' });
    } else {
      toast({ title: 'Ошибка', description: 'Неверный код админа', variant: 'destructive' });
    }
  };

  const spinRoulette = () => {
    if (!currentUser) return;
    const amount = parseInt(betAmount);
    if (!amount || amount < 10) {
      toast({ title: 'Ошибка', description: 'Минимальная ставка 10 золота', variant: 'destructive' });
      return;
    }
    if (amount > currentUser.balance) {
      toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' });
      return;
    }

    setSpinning(true);
    setRouletteResult(null);

    setTimeout(() => {
      const rand = Math.random() * 100;
      let result: string;
      let multiplier = 0;

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
        multiplier = 0;
        setShowWallChoice(true);
      }

      setRouletteResult(result);
      setSpinning(false);

      if (result !== 'X?') {
        const newBalance = currentUser.balance + amount * multiplier;
        updateUserBalance(currentUser.username, newBalance);
        addTransaction(`Рулетка ${result}`, amount * multiplier);
        if (multiplier !== 0) {
          toast({
            title: multiplier > 0 ? 'Выигрыш!' : 'Проигрыш',
            description: multiplier > 0 ? `+${amount * multiplier} золота` : `-${amount} золота`,
          });
        }
      }
    }, 3000);
  };

  const handleWallChoice = (wall: number) => {
    if (!currentUser) return;
    const amount = parseInt(betAmount);
    const walls = [2, 5, 20].sort(() => Math.random() - 0.5);
    const multiplier = walls[wall - 1];
    const winAmount = amount * multiplier;
    updateUserBalance(currentUser.username, currentUser.balance + winAmount);
    addTransaction(`X? - Стена ${wall} (X${multiplier})`, winAmount);
    toast({ title: `Вы выбрали стену ${wall}!`, description: `Выигрыш: +${winAmount} золота (X${multiplier})` });
    setShowWallChoice(false);
    setWallChoice(null);
  };

  const createPlayerBet = () => {
    if (!currentUser) return;
    const amount = parseInt(playerBetAmount);
    if (!amount || amount < 10) {
      toast({ title: 'Ошибка', description: 'Минимальная ставка 10 золота', variant: 'destructive' });
      return;
    }
    if (amount > currentUser.balance) {
      toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' });
      return;
    }

    const newBet: Bet = {
      id: Date.now().toString(),
      creator: currentUser.username,
      amount,
      timestamp: Date.now(),
    };
    setBets([...bets, newBet]);
    updateUserBalance(currentUser.username, currentUser.balance - amount);
    addTransaction('Ставка создана', -amount);
    toast({ title: 'Ставка создана', description: `${amount} золота` });
    setPlayerBetAmount('');
  };

  const acceptPlayerBet = (bet: Bet) => {
    if (!currentUser || bet.creator === currentUser.username) return;
    if (bet.amount > currentUser.balance) {
      toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' });
      return;
    }

    const totalPot = bet.amount * 2;
    const creatorChance = bet.amount;
    const acceptorChance = bet.amount;
    const rand = Math.random() * totalPot;

    updateUserBalance(currentUser.username, currentUser.balance - bet.amount);

    if (rand < creatorChance) {
      const creator = users.find(u => u.username === bet.creator);
      if (creator) {
        updateUserBalance(creator.username, creator.balance + totalPot);
      }
      addTransaction('Ставка проиграна', -bet.amount);
      toast({ title: 'Проигрыш', description: `Вы проиграли ${bet.amount} золота` });
    } else {
      updateUserBalance(currentUser.username, currentUser.balance + totalPot);
      addTransaction('Ставка выиграна', totalPot - bet.amount);
      toast({ title: 'Выигрыш!', description: `Вы выиграли ${totalPot - bet.amount} золота` });
    }

    setBets(bets.filter(b => b.id !== bet.id));
  };

  const updateUserBalance = (username: string, newBalance: number) => {
    setUsers(users.map(u => (u.username === username ? { ...u, balance: newBalance } : u)));
    if (currentUser?.username === username) {
      setCurrentUser({ ...currentUser, balance: newBalance });
    }
  };

  const executeAdminCommand = () => {
    const parts = adminCommand.trim().split(' ');
    if (parts[0] === '/п' && parts.length === 3) {
      const targetUser = parts[1];
      const amountStr = parts[2];
      const isAdd = amountStr.startsWith('+');
      const amount = parseInt(amountStr);

      const user = users.find(u => u.username === targetUser);
      if (user) {
        const newBalance = isAdd ? user.balance + amount : user.balance - Math.abs(amount);
        updateUserBalance(targetUser, Math.max(0, newBalance));
        toast({ title: 'Команда выполнена', description: `${targetUser}: ${isAdd ? '+' : ''}${amount} золота` });
      } else {
        toast({ title: 'Ошибка', description: 'Пользователь не найден', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Ошибка', description: 'Неверная команда', variant: 'destructive' });
    }
    setAdminCommand('');
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black via-black-light to-black">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold text-gold gold-glow mb-4">F12F13 CASINO</h1>
          <p className="text-xl text-gold-light mb-8">Для использования подпишитесь на телеграмм канал</p>
          <Button
            onClick={() => {
              window.open('https://t.me/f12f12f12f12f12f12f12', '_blank');
              setScreen('role');
            }}
            className="bg-gold hover:bg-gold-dark text-black font-bold text-lg px-8 py-6 gold-border-glow"
          >
            <Icon name="Send" className="mr-2" />
            Подписаться и продолжить
          </Button>
        </div>
      </div>
    );
  }

  if (screen === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black via-black-light to-black">
        <div className="animate-scale-in space-y-6">
          <h2 className="text-4xl font-bold text-gold gold-glow text-center mb-8">Выберите роль</h2>
          <Button
            onClick={() => setScreen('auth')}
            className="w-full bg-gold hover:bg-gold-dark text-black font-bold text-xl py-8 gold-border-glow"
          >
            <Icon name="User" className="mr-2" size={24} />
            Я ИГРОК
          </Button>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Код администратора"
              value={adminCode}
              onChange={e => setAdminCode(e.target.value)}
              className="bg-secondary border-gold text-gold-light"
            />
            <Button onClick={handleAdminLogin} className="w-full bg-secondary hover:bg-muted text-gold font-bold py-6">
              <Icon name="Shield" className="mr-2" />
              Я АДМИН
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-black via-black-light to-black">
        <Card className="w-full max-w-md p-8 bg-card border-gold gold-border-glow animate-fade-in">
          <h2 className="text-3xl font-bold text-gold gold-glow text-center mb-6">
            {authMode === 'login' ? 'Вход' : 'Регистрация'}
          </h2>
          <div className="space-y-4">
            <Input
              placeholder="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-secondary border-gold text-gold-light"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-secondary border-gold text-gold-light"
            />
            {authMode === 'register' && (
              <Input
                type="password"
                placeholder="Повторите пароль"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="bg-secondary border-gold text-gold-light"
              />
            )}
            <Button
              onClick={authMode === 'login' ? handleLogin : handleRegister}
              className="w-full bg-gold hover:bg-gold-dark text-black font-bold py-6"
            >
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <Button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              variant="ghost"
              className="w-full text-gold-light"
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
      <div className="min-h-screen p-6 bg-gradient-to-b from-black via-black-light to-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gold gold-glow">F12F13 CASINO</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gold-light text-sm">Баланс</p>
                <p className="text-2xl font-bold text-gold animate-pulse-gold">{currentUser.balance} золота</p>
              </div>
              <Button
                onClick={() => {
                  setCurrentUser(null);
                  setScreen('role');
                }}
                variant="ghost"
                className="text-gold-light"
              >
                <Icon name="LogOut" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="roulette" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="roulette" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                Рулетка
              </TabsTrigger>
              <TabsTrigger value="bets" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                Ставки с игроками
              </TabsTrigger>
              <TabsTrigger value="shop" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                Магазин
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roulette" className="space-y-6">
              <Card className="p-8 bg-card border-gold gold-border-glow">
                <h2 className="text-2xl font-bold text-gold mb-6 text-center">Рулетка казино</h2>
                <div className="flex flex-col items-center gap-6">
                  <div
                    className={`w-64 h-64 rounded-full border-4 border-gold flex items-center justify-center text-4xl font-bold ${
                      spinning ? 'animate-spin-slow' : ''
                    } ${rouletteResult === 'X2' || rouletteResult === 'X?' ? 'text-gold' : 'text-gold-light'}`}
                  >
                    {spinning ? '🎰' : rouletteResult || '???'}
                  </div>
                  <Input
                    type="number"
                    placeholder="Ставка (мин. 10)"
                    value={betAmount}
                    onChange={e => setBetAmount(e.target.value)}
                    disabled={spinning}
                    className="max-w-xs bg-secondary border-gold text-gold-light"
                  />
                  <Button
                    onClick={spinRoulette}
                    disabled={spinning}
                    className="bg-gold hover:bg-gold-dark text-black font-bold px-12 py-6 text-xl"
                  >
                    {spinning ? 'Крутится...' : 'Крутить рулетку'}
                  </Button>
                  <div className="text-center text-gold-light text-sm space-y-1">
                    <p>Шансы: ???</p>
                  </div>
                </div>
              </Card>

              {showWallChoice && (
                <Card className="p-8 bg-card border-gold gold-border-glow animate-scale-in">
                  <h3 className="text-2xl font-bold text-gold mb-6 text-center">Выберите стену!</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(wall => (
                      <Button
                        key={wall}
                        onClick={() => handleWallChoice(wall)}
                        className="bg-gold hover:bg-gold-dark text-black font-bold py-12 text-2xl"
                      >
                        Стена {wall}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-gold-light mt-4 text-sm">За стенами: X2, X5, X20</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bets" className="space-y-6">
              <Card className="p-8 bg-card border-gold gold-border-glow">
                <h2 className="text-2xl font-bold text-gold mb-6">Создать ставку</h2>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Сумма (мин. 10)"
                    value={playerBetAmount}
                    onChange={e => setPlayerBetAmount(e.target.value)}
                    className="bg-secondary border-gold text-gold-light"
                  />
                  <Button onClick={createPlayerBet} className="bg-gold hover:bg-gold-dark text-black font-bold px-8">
                    Создать
                  </Button>
                </div>
              </Card>

              <div className="grid gap-4">
                {bets.map(bet => (
                  <Card key={bet.id} className="p-6 bg-card border-gold animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gold font-bold">{bet.creator}</p>
                        <p className="text-gold-light">Ставка: {bet.amount} золота</p>
                      </div>
                      {bet.creator !== currentUser.username && (
                        <Button
                          onClick={() => acceptPlayerBet(bet)}
                          className="bg-gold hover:bg-gold-dark text-black font-bold"
                        >
                          Принять
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                {bets.length === 0 && <p className="text-center text-gold-light">Нет активных ставок</p>}
              </div>
            </TabsContent>

            <TabsContent value="shop" className="space-y-6">
              <Card className="p-8 bg-card border-gold gold-border-glow">
                <h2 className="text-2xl font-bold text-gold mb-6">Пополнить баланс</h2>
                <p className="text-gold-light mb-4">
                  Купите скин у администратора за нужное количество золота
                </p>
                <Button
                  onClick={() => window.open('https://t.me/Aks1kx_bot', '_blank')}
                  className="w-full bg-gold hover:bg-gold-dark text-black font-bold py-6"
                >
                  <Icon name="MessageCircle" className="mr-2" />
                  Перейти в чат к админу
                </Button>
              </Card>

              <Card className="p-8 bg-card border-gold gold-border-glow">
                <h2 className="text-2xl font-bold text-gold mb-6">Вывод средств</h2>
                <p className="text-gold-light mb-4">Минимальная сумма вывода: 200 золота</p>
                <Button
                  onClick={() => {
                    if (currentUser.balance >= 200) {
                      window.open('https://t.me/Aks1kx_bot', '_blank');
                    } else {
                      toast({ title: 'Ошибка', description: 'Недостаточно средств для вывода', variant: 'destructive' });
                    }
                  }}
                  disabled={currentUser.balance < 200}
                  className="w-full bg-gold hover:bg-gold-dark text-black font-bold py-6"
                >
                  Вывести средства
                </Button>
              </Card>

              <Card className="p-8 bg-card border-gold gold-border-glow">
                <h2 className="text-2xl font-bold text-gold mb-6">Поддержать автора</h2>
                <Input
                  placeholder="Введите код"
                  value={authorCode}
                  onChange={e => setAuthorCode(e.target.value)}
                  className="mb-4 bg-secondary border-gold text-gold-light"
                />
                <Button className="w-full bg-secondary hover:bg-muted text-gold font-bold py-6">
                  Применить код
                </Button>
              </Card>

              <Card className="p-8 bg-card border-gold gold-border-glow">
                <h2 className="text-2xl font-bold text-gold mb-6">История транзакций</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-secondary rounded">
                      <span className="text-gold-light">{t.type}</span>
                      <span className={`font-bold ${t.amount >= 0 ? 'text-gold' : 'text-destructive'}`}>
                        {t.amount >= 0 ? '+' : ''}
                        {t.amount}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-gold-light">Нет транзакций</p>}
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
      <div className="min-h-screen p-6 bg-gradient-to-b from-black via-black-light to-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gold gold-glow">Админ Панель</h1>
            <Button onClick={() => setScreen('role')} variant="ghost" className="text-gold-light">
              <Icon name="LogOut" />
            </Button>
          </div>

          <Card className="p-8 bg-card border-gold gold-border-glow mb-6">
            <h2 className="text-2xl font-bold text-gold mb-4">Консоль команд</h2>
            <p className="text-gold-light text-sm mb-4">Формат: /п [username] +100 или -100</p>
            <div className="flex gap-4">
              <Input
                placeholder="/п username +100"
                value={adminCommand}
                onChange={e => setAdminCommand(e.target.value)}
                className="bg-secondary border-gold text-gold-light"
              />
              <Button onClick={executeAdminCommand} className="bg-gold hover:bg-gold-dark text-black font-bold px-8">
                Выполнить
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-card border-gold gold-border-glow">
            <h2 className="text-2xl font-bold text-gold mb-4">Пользователи</h2>
            <Input
              placeholder="Поиск пользователя..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mb-4 bg-secondary border-gold text-gold-light"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.username} className="p-4 bg-secondary rounded flex justify-between items-center">
                  <div>
                    <p className="text-gold font-bold">{user.username}</p>
                    <p className="text-gold-light text-sm">Пароль: {user.password}</p>
                  </div>
                  <p className="text-gold text-xl font-bold">{user.balance} золота</p>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-center text-gold-light">Пользователи не найдены</p>}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
