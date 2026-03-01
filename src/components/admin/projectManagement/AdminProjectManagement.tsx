import React from 'react';
import { useProjectManagement } from './useProjectManagement';
import ProjectListView from './ProjectListView';
import ProjectDetailView from './ProjectDetailView';

const AdminProjectManagement: React.FC = () => {
  const {
    projects,
    selectedProject,
    loading,
    fetchProjectDetail,
    createProject,
    toggleItem,
    addPhase,
    addItem,
    deleteItem,
    deletePhase,
    uploadDocument,
    deleteDocument,
    deleteProject,
    updateCoverImage,
    reorderItems,
    setSelectedProject,
  } = useProjectManagement();

  const handleSelectProject = async (id: string) => {
    await fetchProjectDetail(id);
  };

  const handleCreateProject = async (name: string) => {
    const project = await createProject(name);
    if (project) {
      await fetchProjectDetail(project.id);
    }
  };

  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onToggleItem={toggleItem}
        onAddPhase={addPhase}
        onAddItem={addItem}
        onDeleteItem={deleteItem}
        onDeletePhase={deletePhase}
        onUploadDocument={uploadDocument}
        onDeleteDocument={deleteDocument}
        onDeleteProject={deleteProject}
        onUpdateCoverImage={updateCoverImage}
        onReorderItems={reorderItems}
      />
    );
  }

  return (
    <ProjectListView
      projects={projects}
      loading={loading}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
      onUpdateCoverImage={updateCoverImage}
    />
  );
};

export default AdminProjectManagement;
