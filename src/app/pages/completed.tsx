import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle2, Home, Download, Share2, Plus, Copy, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Inspection, Signature } from '../types';
import { InspectionStorage } from '../storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CompletedPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerRole, setNewSignerRole] = useState('Locatário');

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

  const handleDownload = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF();
      
      try {
        const logoUrl = new URL('../../assets/logo.png', import.meta.url).href;
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const ratio = img.width / img.height;
        const h = 14;
        const w = h * ratio;
        doc.addImage(img, 'PNG', 14, 10, w, h);
      } catch (e) {
        console.warn("Could not load logo for PDF", e);
      }
      
      doc.setFontSize(20);
      doc.setTextColor(0, 166, 75); // #00A64B
      doc.text('Relatório de Vistoria', 14, 38);
      
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Imóvel: ${inspection.propertyAddress}`, 14, 48);
      doc.text(`Tipo: ${inspection.type === 'entrada' ? 'Entrada' : 'Saída'}`, 14, 54);
      doc.text(`Data: ${format(inspection.createdAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 60);
      if (inspection.completedAt) {
        doc.text(`Concluída em: ${format(inspection.completedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 66);
      }
      
      let currentY = 76;
      
      inspection.rooms.forEach((room) => {
        autoTable(doc, {
          startY: currentY,
          head: [[room.name.toUpperCase()]],
          theme: 'grid',
          headStyles: { fillColor: [0, 166, 75], textColor: 255 },
          margin: { bottom: 0 },
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 1;
        
        if (room.items.length === 0) {
          autoTable(doc, {
            startY: currentY,
            body: [['Nenhum problema encontrado']],
            theme: 'plain',
            styles: { textColor: [0, 150, 0] }
          });
          currentY = (doc as any).lastAutoTable.finalY + 2;
        } else {
          const bodyData = room.items.map((item, index) => [`${index + 1}`, item.description]);
          autoTable(doc, {
            startY: currentY,
            head: [['#', 'Descrição do Problema']],
            body: bodyData,
            theme: 'striped',
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] },
            columnStyles: { 0: { cellWidth: 10 } }
          });
          currentY = (doc as any).lastAutoTable.finalY + 2;
        }
        
        if (room.photos.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          currentY += 4;
          doc.text(`${room.photos.length} foto(s) registrada(s)`, 14, currentY);
          currentY += 2;
        }
        
        currentY += 8;
      });
      
      if (inspection.notes) {
        autoTable(doc, {
          startY: currentY,
          head: [['OBSERVAÇÕES GERAIS']],
          body: [[inspection.notes]],
          theme: 'plain',
          headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }
        });
      }
      
      doc.save(`vistoria-${inspection.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Erro ao gerar PDF da vistoria.');
    }
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

      {/* Forms and Signatures */}
      <div className="px-6 mb-6">
        <h3 className="mb-3">Signatários Digitais</h3>
        
        {inspection.signatures && inspection.signatures.length > 0 && (
          <div className="space-y-3 mb-4">
            {inspection.signatures.map(sig => {
              const link = `${window.location.origin}/assinatura/${inspection.id}/${sig.id}`;
              return (
                <div key={sig.id} className="bg-card border border-border p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{sig.name}</p>
                      <p className="text-xs text-muted-foreground">{sig.role} • {sig.email}</p>
                    </div>
                    {sig.status === 'assinado' && <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="size-3" /> Assinado</span>}
                    {sig.status === 'recusado' && <span className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldAlert className="size-3" /> Recusado</span>}
                    {sig.status === 'pendente' && <span className="bg-warning/10 text-warning text-xs px-2 py-0.5 rounded-full">Pendente</span>}
                  </div>
                  
                  {sig.status !== 'assinado' && (
                    <div className="flex gap-2 pt-2 border-t border-border mt-2">
                      <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => {
                        navigator.clipboard.writeText(link);
                        alert('Link copiado para a área de transferência!');
                      }}>
                        <Copy className="size-3 mr-1" /> Copiar Link
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => {
                        alert(`E-mail simulado enviado para ${sig.email}`);
                      }}>
                        <Mail className="size-3 mr-1" /> Enviar Email
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-card border border-primary/20 p-4 rounded-xl border-dashed">
          <p className="text-sm font-medium mb-3">Adicionar Signatário</p>
          <div className="space-y-3">
            <Input placeholder="Nome completo" value={newSignerName} onChange={e => setNewSignerName(e.target.value)} />
            <Input placeholder="E-mail" value={newSignerEmail} onChange={e => setNewSignerEmail(e.target.value)} type="email" />
            <select
              value={newSignerRole}
              onChange={(e) => setNewSignerRole(e.target.value)}
              className="w-full p-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Locatário">Locatário</option>
              <option value="Locador">Locador</option>
              <option value="Fiador">Fiador</option>
              <option value="Corretor">Corretor / Vistoriador</option>
            </select>
            <Button className="w-full" disabled={!newSignerName || !newSignerEmail} onClick={() => {
              if (!newSignerName || !newSignerEmail) return;
              const newSig: Signature = {
                id: `sig-${Date.now()}`,
                name: newSignerName,
                email: newSignerEmail,
                role: newSignerRole,
                status: 'pendente'
              };
              const updated = { ...inspection, signatures: [...(inspection.signatures || []), newSig] };
              InspectionStorage.save(updated);
              setInspection(updated);
              setNewSignerName('');
              setNewSignerEmail('');
            }}>
              <Plus className="size-4 mr-1" />
              Adicionar
            </Button>
          </div>
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