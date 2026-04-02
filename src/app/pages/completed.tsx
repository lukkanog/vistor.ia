import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle2, Home, Download, Share2 } from 'lucide-react';
import { Button } from '../components/button';
import { Inspection } from '../types';
import { InspectionStorage } from '../storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CompletedPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    if (id) {
      const data = InspectionStorage.getById(id);
      if (data) {
        setInspection(data);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!inspection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="size-8 rounded-full bg-primary/20" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const totalItems = inspection.rooms.reduce((sum, room) => sum + room.items.length, 0);
  const totalPhotos = inspection.rooms.reduce((sum, room) => sum + room.photos.length, 0);
  const roomsWithIssues = inspection.rooms.filter(room => room.items.length > 0).length;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Vistoria - ${inspection.propertyAddress}`,
        text: `Vistoria de ${inspection.type} concluída com ${totalItems} problemas encontrados.`,
      });
    } else {
      alert('Compartilhamento não disponível neste navegador');
    }
  };

  const handleDownload = () => {
    // Generate a simple text report
    let report = `RELATÓRIO DE VISTORIA - vistor.ia\n\n`;
    report += `Imóvel: ${inspection.propertyAddress}\n`;
    report += `Tipo: ${inspection.type === 'entrada' ? 'Entrada' : 'Saída'}\n`;
    report += `Data: ${format(inspection.createdAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    if (inspection.completedAt) {
      report += `Concluída em: ${format(inspection.completedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    }
    report += `\n${'='.repeat(50)}\n\n`;

    inspection.rooms.forEach((room) => {
      report += `${room.name.toUpperCase()}\n`;
      report += `-`.repeat(room.name.length) + `\n\n`;
      
      if (room.items.length === 0) {
        report += `✓ Nenhum problema encontrado\n\n`;
      } else {
        room.items.forEach((item, index) => {
          report += `${index + 1}. ${item.description}\n`;
        });
        report += `\n`;
      }
      
      if (room.photos.length > 0) {
        report += `📷 ${room.photos.length} foto(s) anexada(s)\n\n`;
      }
    });

    if (inspection.notes) {
      report += `\nOBSERVAÇÕES GERAIS\n`;
      report += `=`.repeat(20) + `\n`;
      report += `${inspection.notes}\n`;
    }

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vistoria-${inspection.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-success text-success-foreground px-6 pt-12 pb-12 text-center">
        <div className="size-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle2 className="size-12" />
        </div>
        <h1 className="text-2xl mb-2">Vistoria Concluída!</h1>
        <p className="text-success-foreground/90">
          Todos os ambientes foram inspecionados
        </p>
      </div>

      {/* Summary Cards */}
      <div className="px-6 -mt-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl mb-1">{totalItems}</p>
            <p className="text-xs text-muted-foreground">Problemas</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl mb-1">{totalPhotos}</p>
            <p className="text-xs text-muted-foreground">Fotos</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl mb-1">{roomsWithIssues}</p>
            <p className="text-xs text-muted-foreground">Ambientes</p>
          </div>
        </div>
      </div>

      {/* Inspection Details */}
      <div className="px-6 mb-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="mb-4">Detalhes da Vistoria</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Imóvel</span>
              <span>{inspection.propertyAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                inspection.type === 'entrada'
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              }`}>
                {inspection.type === 'entrada' ? 'Entrada' : 'Saída'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Iniciada em</span>
              <span className="text-sm">
                {format(inspection.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            {inspection.completedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concluída em</span>
                <span className="text-sm">
                  {format(inspection.completedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rooms Summary */}
      <div className="px-6 mb-6">
        <h3 className="mb-3">Resumo por Ambiente</h3>
        <div className="space-y-2">
          {inspection.rooms.map((room) => (
            <div
              key={room.id}
              className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
            >
              <div>
                <p>{room.name}</p>
                <p className="text-sm text-muted-foreground">
                  {room.items.length === 0 ? (
                    <span className="text-success">✓ Sem problemas</span>
                  ) : (
                    `${room.items.length} problema(s) • ${room.photos.length} foto(s)`
                  )}
                </p>
              </div>
              {room.items.length > 0 && (
                <div className="size-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <span className="text-warning">{room.items.length}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-8 space-y-3">
        <Button onClick={handleDownload} variant="secondary" className="w-full" size="lg">
          <Download className="size-5" />
          Baixar Relatório
        </Button>
        <Button onClick={handleShare} variant="secondary" className="w-full" size="lg">
          <Share2 className="size-5" />
          Compartilhar
        </Button>
        <Button onClick={() => navigate('/')} className="w-full" size="lg">
          <Home className="size-5" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}