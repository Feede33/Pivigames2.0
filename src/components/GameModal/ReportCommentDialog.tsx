import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'misinformation'
  | 'inappropriate'
  | 'other';

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: 'Spam o publicidad',
    description: 'Contenido promocional no deseado o repetitivo'
  },
  {
    value: 'harassment',
    label: 'Acoso o intimidación',
    description: 'Comportamiento abusivo hacia otros usuarios'
  },
  {
    value: 'hate_speech',
    label: 'Discurso de odio',
    description: 'Contenido que promueve odio o discriminación'
  },
  {
    value: 'misinformation',
    label: 'Desinformación',
    description: 'Información falsa o engañosa'
  },
  {
    value: 'inappropriate',
    label: 'Contenido inapropiado',
    description: 'Contenido sexual, violento o perturbador'
  },
  {
    value: 'other',
    label: 'Otro',
    description: 'Otra razón no listada arriba'
  }
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
  commentAuthor: string;
};

export default function ReportCommentDialog({ isOpen, onClose, onSubmit, commentAuthor }: Props) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onSubmit(reason, details);
      setReason('spam');
      setDetails('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('spam');
      setDetails('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Reportar comentario
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Reportar el comentario de <span className="font-semibold text-gray-300">{commentAuthor}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-3 block">
              ¿Por qué reportas este comentario?
            </Label>
            <RadioGroup value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <div className="space-y-3">
                {REPORT_REASONS.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={option.value} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-gray-200">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details" className="text-sm font-medium text-gray-300 mb-2 block">
              Detalles adicionales (opcional)
            </Label>
            <Textarea
              id="details"
              placeholder="Proporciona más información sobre el problema..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px] bg-gray-800 border-gray-700 text-gray-200"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
