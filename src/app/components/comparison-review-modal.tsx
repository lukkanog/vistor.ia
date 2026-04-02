import { useState } from 'react';
import { ChevronRight, X, AlertOctagon, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Inspection, ComparisonStatus } from '../types';

interface ComparisonReviewModalProps {
  inspection: Inspection;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ComparisonReviewModal({ inspection, onConfirm, onCancel }: ComparisonReviewModalProps) {
  // Aggregate all items
  const allItems = inspection.rooms.flatMap(room => 
    room.items.map(item => ({ ...item, roomName: room.name }))
  );

  const novosDanos = allItems.filter(i => i.comparisonStatus === 'novo_dano' || !i.comparisonStatus);
  const resolvidos = allItems.filter(i => i.comparisonStatus === 'resolvido');
  const modificados = allItems.filter(i => i.comparisonStatus === 'modificado');
  const semAlteracao = allItems.filter(i => i.comparisonStatus === 'sem_alteracao');

  const renderSection = (title: string, items: typeof allItems, icon: React.ReactNode, typeClass: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6 bg-card border border-border rounded-xl overflow-hidden">
        <div className={`flex items-center gap-2 p-4 border-b border-border bg-opacity-20 ${typeClass}`}>
          {icon}
          <h3 className="font-medium">{title} ({items.length})</h3>
        </div>
        <div className="p-4 space-y-3">
          {items.map(item => (
            <div key={item.id} className="text-sm">
              <span className="text-muted-foreground text-xs font-medium block mb-1">{item.roomName}</span>
              <p className="text-foreground">{item.description}</p>
              {item.originalDescription && item.comparisonStatus === 'modificado' && (
                <p className="text-muted-foreground text-xs mt-1 border-l-2 border-primary/30 pl-2">
                  Era: {item.originalDescription}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="size-6" />
        </button>
        <h3 className="font-medium">Resumo de Comparação</h3>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-muted-foreground text-sm mb-6">
          Revise as diferenças detectadas antes de salvar a vistoria final.
        </p>

        {renderSection("Novos Danos Detectados", novosDanos, <AlertOctagon className="size-5" />, "bg-destructive/10 text-destructive border-b-destructive/20")}
        {renderSection("Problemas Modificados (Piorou/Agravou)", modificados, <AlertCircle className="size-5" />, "bg-warning/10 text-warning border-b-warning/20")}
        {renderSection("Problemas Resolvidos", resolvidos, <CheckCircle2 className="size-5" />, "bg-success/10 text-success border-b-success/20")}
        {renderSection("Sem Alteração", semAlteracao, <RotateCcw className="size-5" />, "bg-muted text-muted-foreground")}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <Button
          className="w-full"
          size="lg"
          variant="success"
          onClick={onConfirm}
        >
          Confirmar e Fechar Vistoria
          <ChevronRight className="size-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
