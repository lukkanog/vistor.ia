import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { InspectionStorage } from '../storage';
import { Inspection, Signature } from '../types';
import { Button } from '../components/button';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { SignaturePad } from '../components/signature-pad';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SignaturePortalPage() {
  const { id, signatureId } = useParams<{ id: string, signatureId: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [showPad, setShowPad] = useState(false);

  useEffect(() => {
    if (id && signatureId) {
      const data = InspectionStorage.getById(id);
      if (data) {
        setInspection(data);
        const sig = data.signatures?.find((s: Signature) => s.id === signatureId);
        if (sig) setSignature(sig);
      }
    }
  }, [id, signatureId]);

  if (!inspection || !signature) {
    return <div className="p-8 text-center text-muted-foreground">Documento não encontrado ou link inválido.</div>;
  }

  const handleSign = (dataUrl: string) => {
    const updated = { ...inspection };
    const sigIndex = updated.signatures?.findIndex((s: Signature) => s.id === signatureId);
    if (sigIndex !== undefined && sigIndex !== -1 && updated.signatures) {
      updated.signatures[sigIndex].status = 'assinado';
      updated.signatures[sigIndex].signatureDataUrl = dataUrl;
      updated.signatures[sigIndex].signedAt = new Date();
      InspectionStorage.save(updated);
      setInspection(updated);
      setSignature(updated.signatures[sigIndex]);
    }
    setShowPad(false);
  };

  const handleReject = () => {
    if (!confirm('Tem certeza que deseja recusar este relatório? O remetente será notificado.')) return;
    const updated = { ...inspection };
    const sigIndex = updated.signatures?.findIndex((s: Signature) => s.id === signatureId);
    if (sigIndex !== undefined && sigIndex !== -1 && updated.signatures) {
      updated.signatures[sigIndex].status = 'recusado';
      updated.signatures[sigIndex].signedAt = new Date();
      InspectionStorage.save(updated);
      setInspection(updated);
      setSignature(updated.signatures[sigIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-6 pt-12 pb-8 text-primary-foreground text-center">
        <h1 className="text-2xl font-medium mb-1">Portal de Assinatura</h1>
        <p className="opacity-90 text-sm">Vistoria de {inspection.type === 'entrada' ? 'Entrada' : 'Saída'}</p>
      </div>

      <div className="px-6 -mt-4 mb-6">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Signatário</p>
          <p className="font-medium text-lg">{signature.name}</p>
          <p className="text-sm">{signature.role} • {signature.email}</p>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Imóvel</p>
            <p className="font-medium">{inspection.propertyAddress}</p>
            <p className="text-sm text-muted-foreground mt-2">Data da Inspeção</p>
            <p className="font-medium">{format(inspection.createdAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
          </div>
        </div>
      </div>

      {signature.status === 'pendente' && (
        <div className="px-6 space-y-4">
          <Button onClick={() => setShowPad(true)} className="w-full text-lg h-14 bg-success hover:bg-success/90">
            Assinar Documento
          </Button>
          <Button onClick={handleReject} variant="secondary" className="w-full text-lg h-14 text-destructive hover:text-destructive">
            Recusar Documento
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4 px-4">
            Ao assinar, você concorda com os termos registrados na vistoria do imóvel citado.
          </p>
        </div>
      )}

      {signature.status === 'assinado' && (
        <div className="px-6 text-center animate-in fade-in zoom-in slide-in-from-bottom-4">
          <div className="size-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h2 className="text-xl font-medium text-success mb-2">Documento Assinado</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sua assinatura foi registrada com sucesso em {format(signature.signedAt!, "dd/MM/yy 'às' HH:mm", { locale: ptBR })}.
          </p>
          <img src={signature.signatureDataUrl} className="mx-auto border border-border rounded-xl bg-white w-64 p-4 object-contain" alt="Assinatura" />
        </div>
      )}

      {signature.status === 'recusado' && (
        <div className="px-6 text-center animate-in fade-in zoom-in slide-in-from-bottom-4">
          <div className="size-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="size-8 text-destructive" />
          </div>
          <h2 className="text-xl font-medium text-destructive mb-2">Relatório Recusado</h2>
          <p className="text-muted-foreground text-sm">
            Você recusou este relatório. A imobiliária/locador será notificado para realizar as correções.
          </p>
        </div>
      )}

      {showPad && (
        <SignaturePad 
          onSave={handleSign}
          onCancel={() => setShowPad(false)} 
        />
      )}
    </div>
  );
}
