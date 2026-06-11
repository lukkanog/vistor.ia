import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import { Button } from '../components/button';
import { Input } from '../components/input';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = name.trim() && email.trim() && password.trim();

  return (
    <div className="min-h-screen bg-primary">
      <div className="px-6 pt-14 pb-10 text-primary-foreground">
        <img src={logo} alt="vistor.ia" className="h-14 w-auto object-contain brightness-0 invert" />
      </div>

      <div className="min-h-[calc(100vh-8.5rem)] rounded-t-[2rem] bg-background px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-[2rem] leading-tight text-foreground">Criar conta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre-se para iniciar vistorias e acompanhar seu fluxo de trabalho.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Nome completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button
              className="w-full"
              size="lg"
              disabled={!canSubmit}
              onClick={() => navigate('/login')}
            >
              Criar conta
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary">
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
