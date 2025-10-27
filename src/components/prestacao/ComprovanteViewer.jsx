// src/components/prestacao/ComprovanteViewer.jsx
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ModalOverlay = ({ onClose }) => (
  <div 
    className="fixed inset-0 z-[90] bg-black/80 animate-in fade-in-0"
    onClick={onClose}
  />
);

const ImageViewer = ({ url, onClose }) => (
  <>
    <ModalOverlay onClose={onClose} />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <Button 
        variant="ghost" size="icon" 
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 hover:text-white"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>
      <img
        src={url}
        alt="Comprovante"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  </>
);

const PdfViewer = ({ url, onClose }) => (
  <>
    <ModalOverlay onClose={onClose} />
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="w-11/12 h-5/6 max-w-4xl flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 pl-4">Visualizador de Comprovante</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1">
          <iframe
            src={url}
            title="Visualizador de PDF"
            width="100%"
            height="100%"
            className="border-none rounded-b-lg"
          ></iframe>
        </div>
      </Card>
    </div>
  </>
);

export default function ComprovanteViewer({ url, onClose }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  if (isImage) {
    return <ImageViewer url={url} onClose={onClose} />;
  }

  if (isPdf) {
    return <PdfViewer url={url} onClose={onClose} />;
  }

  window.open(url, '_blank');
  onClose();
  return null;
}