import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "framer-motion";

interface TrailerModalProps {
  videoKey: string | null;
  onClose: () => void;
}

const TrailerModal = ({ videoKey, onClose }: TrailerModalProps) => {
  return (
    <Dialog open={!!videoKey} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 bg-background border-border overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Movie Trailer</DialogTitle>
        </VisuallyHidden>
        <motion.div 
          className="relative aspect-video w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
          {videoKey && (
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
              title="Movie Trailer"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;
