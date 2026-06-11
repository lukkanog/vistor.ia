import { Link } from 'react-router';
import logo from '../../assets/logo.png';
import { Button } from '../components/button';
import { Input } from '../components/input';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="px-6 pt-14 pb-10 text-primary-foreground">
        <img src={logo} alt="vistor.ia" className="h-14 w-auto object-contain brightness-0 invert" />
      </div>

      <div className="min-h-[calc(100vh-8.5rem)] rounded-t-[2rem] bg-background px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-[2rem] leading-tight text-foreground">Recuperar senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe seu e-mail e enviaremos as instruções de acesso.
            </p>
          </div>

          <div className="space-y-4">
            <Input type="email" placeholder="E-mail" />
            <Button className="w-full" size="lg">
              Enviar instruções
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
