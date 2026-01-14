import { X } from 'lucide-react';

type Props = {
  onClose: () => void;
  styles: any;
};

export default function ModalHeader({ onClose, styles }: Props) {
  return (
    <button
      onClick={onClose}
      style={styles.modal.closeButton}
      className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 border-none rounded-full flex items-center justify-center cursor-pointer z-50 transition-colors shadow-lg"
    >
      <X style={styles.modal.closeIcon} className="text-white" />
    </button>
  );
}
