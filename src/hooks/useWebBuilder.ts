import { useState, useCallback, createContext, useContext } from 'react';

export interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'section' | 'product' | 'button' | 'gallery';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  styles?: string;
  parentId?: string;
  sectionType?: string;
  productData?: any[];
  isVisible?: boolean;
}

export interface WebBuilderState {
  isBuilderMode: boolean;
  selectedElement: EditableElement | null;
  elements: EditableElement[];
  showOutlines: boolean;
  editHistory: EditableElement[][];
  currentHistoryIndex: number;
}

export const useWebBuilder = () => {
  const [state, setState] = useState<WebBuilderState>({
    isBuilderMode: false,
    selectedElement: null,
    elements: [],
    showOutlines: true,
    editHistory: [],
    currentHistoryIndex: -1,
  });

  const toggleBuilderMode = useCallback(() => {
    setState(prev => ({ ...prev, isBuilderMode: !prev.isBuilderMode }));
  }, []);

  const selectElement = useCallback((element: EditableElement | null) => {
    setState(prev => ({ ...prev, selectedElement: element }));
  }, []);

  const updateElement = useCallback((updatedElement: EditableElement) => {
    setState(prev => {
      const newElements = prev.elements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      );
      
      // Add to history
      const newHistory = [...prev.editHistory.slice(0, prev.currentHistoryIndex + 1), newElements];
      
      return {
        ...prev,
        elements: newElements,
        editHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      };
    });
  }, []);

  const addElement = useCallback((element: EditableElement) => {
    setState(prev => {
      const newElements = [...prev.elements, element];
      
      // Add to history
      const newHistory = [...prev.editHistory.slice(0, prev.currentHistoryIndex + 1), newElements];
      
      return {
        ...prev,
        elements: newElements,
        editHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      };
    });
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setState(prev => {
      const newElements = prev.elements.filter(el => el.id !== elementId);
      
      // Add to history
      const newHistory = [...prev.editHistory.slice(0, prev.currentHistoryIndex + 1), newElements];
      
      return {
        ...prev,
        elements: newElements,
        editHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
        selectedElement: prev.selectedElement?.id === elementId ? null : prev.selectedElement,
      };
    });
  }, []);

  const duplicateElement = useCallback((element: EditableElement) => {
    const duplicated: EditableElement = {
      ...element,
      id: `${element.id}-copy-${Date.now()}`,
      position: { x: element.position.x + 20, y: element.position.y + 20 }
    };
    addElement(duplicated);
  }, [addElement]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const sectionElements = prev.elements.filter(el => el.type === 'section');
      const currentIndex = sectionElements.findIndex(el => el.id === sectionId);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sectionElements.length) return prev;
      
      // Swap positions
      const newElements = [...prev.elements];
      const elementIndex1 = newElements.findIndex(el => el.id === sectionElements[currentIndex].id);
      const elementIndex2 = newElements.findIndex(el => el.id === sectionElements[newIndex].id);
      
      [newElements[elementIndex1], newElements[elementIndex2]] = [newElements[elementIndex2], newElements[elementIndex1]];
      
      // Add to history
      const newHistory = [...prev.editHistory.slice(0, prev.currentHistoryIndex + 1), newElements];
      
      return {
        ...prev,
        elements: newElements,
        editHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.currentHistoryIndex > 0) {
        const newIndex = prev.currentHistoryIndex - 1;
        return {
          ...prev,
          elements: prev.editHistory[newIndex],
          currentHistoryIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.currentHistoryIndex < prev.editHistory.length - 1) {
        const newIndex = prev.currentHistoryIndex + 1;
        return {
          ...prev,
          elements: prev.editHistory[newIndex],
          currentHistoryIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const toggleOutlines = useCallback(() => {
    setState(prev => ({ ...prev, showOutlines: !prev.showOutlines }));
  }, []);

  return {
    ...state,
    toggleBuilderMode,
    selectElement,
    updateElement,
    addElement,
    deleteElement,
    duplicateElement,
    moveSection,
    undo,
    redo,
    toggleOutlines,
  };
};

// Create context for web builder
export const WebBuilderContext = createContext<ReturnType<typeof useWebBuilder> | null>(null);

export const useWebBuilderContext = () => {
  const context = useContext(WebBuilderContext);
  if (!context) {
    throw new Error('useWebBuilderContext must be used within a WebBuilderProvider');
  }
  return context;
};