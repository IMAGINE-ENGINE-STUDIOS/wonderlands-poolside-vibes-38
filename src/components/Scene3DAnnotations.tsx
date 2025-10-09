import { Html } from '@react-three/drei';
import { Annotation } from './scene3d/types';
import { X, Check } from 'lucide-react';

interface Scene3DAnnotationsProps {
  annotations: Annotation[];
  onDelete?: (id: string) => void;
  onToggleConfirm?: (id: string) => void;
}

export const Scene3DAnnotations: React.FC<Scene3DAnnotationsProps> = ({
  annotations,
  onDelete,
  onToggleConfirm
}) => {
  return (
    <>
      {annotations.map((note) => (
        <Html
          key={note.id}
          position={note.position}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className={`relative p-3 rounded-lg shadow-lg min-w-[200px] max-w-[300px] transition-all ${
              note.confirmed
                ? 'bg-green-100 border-2 border-green-500'
                : 'bg-yellow-100 border-2 border-yellow-500'
            }`}
            style={{ backgroundColor: note.confirmed ? undefined : note.color }}
          >
            {/* Close button */}
            {onDelete && (
              <button
                onClick={() => onDelete(note.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Confirmation badge */}
            {note.confirmed && (
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Note content */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">{note.text}</p>
              
              {note.price && (
                <div className="text-lg font-bold text-gray-900">
                  ${note.price.toLocaleString()}
                </div>
              )}

              {/* Confirm button */}
              {onToggleConfirm && (
                <button
                  onClick={() => onToggleConfirm(note.id)}
                  className={`w-full px-3 py-1 rounded text-sm font-medium transition-colors ${
                    note.confirmed
                      ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {note.confirmed ? 'Confirmed ✓' : 'Confirm'}
                </button>
              )}
            </div>

            {/* Pointer triangle */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div
                className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent"
                style={{
                  borderTopColor: note.confirmed ? '#10b981' : note.color
                }}
              />
            </div>
          </div>
        </Html>
      ))}
    </>
  );
};
