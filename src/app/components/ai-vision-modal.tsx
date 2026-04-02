import { useState, useEffect } from 'react';
import { X, CheckCircle2, ChevronRight, Edit3, Trash2, Zap, Loader2 } from 'lucide-react';
import { Button } from './button';

export interface AIVisionModalProps {
  mediaUrl: string;
  onComplete: (acceptedIssues: string[]) => void;
  onCancel: () => void;
}

type SuggestionStatus = 'pending' | 'accepted' | 'ignored';

interface Suggestion {
  id: string;
  text: string;
  status: SuggestionStatus;
}

const MOCK_ISSUES = [
  "Risco profundo na parede rebocada",
  "Mancha de umidade no teto",
  "Piso de cerâmica com leve trinca"
];

export function AIVisionModal({ mediaUrl, onComplete, onCancel }: AIVisionModalProps) {
  const [phase, setPhase] = useState<'analyzing' | 'results'>('analyzing');
  const [loadingStep, setLoadingStep] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const loadingTexts = [
    "Enviando mídia para serviço de visão...",
    "Processando imagem/frames...",
    "Detectando objetos no ambiente...",
    "Detectando possíveis danos...",
    "Gerando sugestões de problemas..."
  ];

  useEffect(() => {
    // Initialize mock issues
    setSuggestions(
      MOCK_ISSUES.map((text, i) => ({
        id: `mock-issue-${i}`,
        text,
        status: 'pending'
      }))
    );

    // Mock AI sequence
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingTexts.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
        setPhase('results');
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleAccept = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
  };

  const handleIgnore = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'ignored' } : s));
  };

  const handleSaveEdit = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id 
        ? { ...s, text: editText, status: 'accepted' } 
        : s
    ));
    setEditingId(null);
    setEditText('');
  };

  const handleFinish = () => {
    const acceptedIssues = suggestions
      .filter(s => s.status === 'accepted')
      .map(s => s.text);
    onComplete(acceptedIssues);
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

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
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-yellow-400" />
          <h3 className="font-medium">Análise de IA</h3>
        </div>
        <div className="w-10" />
      </div>

      {phase === 'analyzing' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="size-16 text-primary animate-spin mb-6" />
          <h2 className="text-xl font-medium mb-2">Analisando Mídia</h2>
          <p className="text-muted-foreground transition-all duration-300">
            {loadingTexts[loadingStep]}
          </p>
          <div className="w-full max-w-xs bg-muted rounded-full h-2 mt-8 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${((loadingStep + 1) / loadingTexts.length) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
          <div className="p-6 pb-2">
            <h2 className="text-xl font-medium mb-1">Resultados da Análise</h2>
            <p className="text-muted-foreground text-sm">
              Encontramos os seguintes possíveis problemas. Aceite ou edite os que desejar incluir na vistoria.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id} 
                className={`bg-card border rounded-xl p-4 transition-colors ${
                  suggestion.status === 'accepted' ? 'border-success bg-success/5' : 
                  suggestion.status === 'ignored' ? 'border-border/50 opacity-50' : 
                  'border-border'
                }`}
              >
                {editingId === suggestion.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 bg-input-background border border-border rounded-lg"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(suggestion.id)} className="flex-1">
                        Salvar e Aceitar
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <p className={`flex-1 flex gap-2 ${suggestion.status === 'ignored' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {suggestion.text}
                      </p>
                    </div>

                    {suggestion.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1"
                          onClick={() => handleAccept(suggestion.id)}
                        >
                          <CheckCircle2 className="size-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingId(suggestion.id);
                            setEditText(suggestion.text);
                          }}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleIgnore(suggestion.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                    
                    {suggestion.status === 'accepted' && (
                      <div className="flex items-center text-success text-sm font-medium">
                        <CheckCircle2 className="size-4 mr-2" />
                        Adicionado à vistoria
                        <button 
                          onClick={() => setSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, status: 'pending' } : s))}
                          className="ml-auto text-muted-foreground font-normal text-xs underline"
                        >
                          Desfazer
                        </button>
                      </div>
                    )}

                    {suggestion.status === 'ignored' && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Trash2 className="size-4 mr-2" />
                        Ignorado
                        <button 
                          onClick={() => setSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, status: 'pending' } : s))}
                          className="ml-auto font-normal text-xs underline"
                        >
                          Desfazer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-card">
            <Button
              className="w-full"
              size="lg"
              variant="success"
              onClick={handleFinish}
            >
              Concluir e Salvar 
              {pendingCount > 0 && <span className="font-normal opacity-80 text-sm ml-1">({pendingCount} pendentes)</span>}
              <ChevronRight className="size-5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
