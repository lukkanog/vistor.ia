import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LockKeyhole, Mail } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { AccountStorage } from '../account-storage';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) return;

    AccountStorage.update({
      email: email.trim(),
    });
    navigate('/selecionar-visualizacao');
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="px-6 pt-14 pb-10 text-primary-foreground">
        <img src={logo} alt="vistor.ia" className="h-14 w-auto object-contain brightness-0 invert" />
      </div>

      <div className="min-h-[calc(100vh-8.5rem)] rounded-t-[2rem] bg-background px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-[2rem] leading-tight text-foreground">Iniciar sessão</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse sua conta para acompanhar vistorias, laudos e assinaturas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-11"
              />
            </div>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-11"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" size="lg" disabled={!email.trim() || !password.trim()}>
                Entrar
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <Link to="/recuperar-senha" className="text-primary">
              Esqueci minha senha
            </Link>
            <p className="text-muted-foreground">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="text-primary">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
