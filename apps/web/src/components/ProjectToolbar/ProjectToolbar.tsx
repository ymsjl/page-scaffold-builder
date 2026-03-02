import React, { useMemo, useRef, useState } from 'react';
import { Button, Input, List, Modal, Space, Typography, message } from 'antd';
import { useStore } from 'react-redux';
import type { RootState } from '@/store/rootReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useLazyGetProjectQuery,
  useListProjectsQuery,
  useUpdateProjectMutation,
} from '@/store/api/baseApi';
import { buildProjectSnapshot, hydrateProjectSnapshot } from '@/store/projectSnapshot';
import { selectCurrentProject } from '@/store/projectSlice/selectors';
import { setCurrentProject } from '@/store/projectSlice/projectSlice';
import { buildCodeExportZip } from '@/services/codeExport/exportCodePackage';
import type { ProjectSnapshot } from '@/types/ProjectSnapshot';

const toFileName = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase();

export const ProjectToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const currentProject = useAppSelector(selectCurrentProject);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: projects = [], isFetching, refetch } = useListProjectsQuery();
  const [loadProject] = useLazyGetProjectQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const projectTitle = currentProject?.name || '未命名项目';
  const isBusy = isSaving || isCreating || isDeleting;

  const handleSaveSnapshot = async (snapshot: ProjectSnapshot) => {
    if (currentProject?.id) {
      const saved = await updateProject({ id: currentProject.id, snapshot }).unwrap();
      dispatch(setCurrentProject(saved.meta));
      message.success('已保存');
      return;
    }

    const saved = await createProject(snapshot).unwrap();
    dispatch(setCurrentProject(saved.meta));
    message.success('已保存');
  };

  const handleSave = async () => {
    try {
      const snapshot = buildProjectSnapshot(store.getState());
      await handleSaveSnapshot(snapshot);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleSaveAs = async () => {
    const trimmed = saveAsName.trim();
    if (!trimmed) {
      message.warning('请输入项目名称');
      return;
    }

    try {
      const snapshot = buildProjectSnapshot(
        store.getState(),
        { name: trimmed },
        { forceNewId: true },
      );
      const saved = await createProject(snapshot).unwrap();
      dispatch(setCurrentProject(saved.meta));
      setSaveAsOpen(false);
      setSaveAsName('');
      message.success('已另存为');
      refetch();
    } catch (error) {
      message.error('另存为失败');
    }
  };

  const handleExport = async () => {
    try {
      const snapshot = buildProjectSnapshot(store.getState());
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${toFileName(snapshot.meta.name) || 'project'}.json`;
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      message.success('已导出');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const handleExportCode = async () => {
    try {
      const snapshot = buildProjectSnapshot(store.getState());
      const blob = buildCodeExportZip(snapshot);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${toFileName(snapshot.meta.name) || 'project'}-code-export.zip`;
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      message.success('已导出代码');
    } catch (error) {
      if (error instanceof Error && error.message === 'NO_PAGES') {
        message.warning('没有可导出的页面');
        return;
      }
      message.error('导出代码失败');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const raw = await file.text();
      const snapshot = JSON.parse(raw) as ProjectSnapshot;
      const saved = await createProject(snapshot).unwrap();
      hydrateProjectSnapshot(dispatch, saved);
      message.success('已导入');
      refetch();
    } catch (error) {
      message.error('导入失败');
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const snapshot = await loadProject(projectId).unwrap();
      hydrateProjectSnapshot(dispatch, snapshot);
      setLoadOpen(false);
      message.success('已加载');
    } catch (error) {
      message.error('加载失败');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId).unwrap();
      message.success('已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const listHeader = useMemo(
    () => (
      <Space align="center">
        <Typography.Text>项目列表</Typography.Text>
        <Button size="small" onClick={() => refetch()} disabled={isFetching}>
          刷新
        </Button>
      </Space>
    ),
    [isFetching, refetch],
  );

  return (
    <Space align="center" size="middle">
      <Typography.Text strong>{projectTitle}</Typography.Text>
      <Space>
        <Button type="primary" onClick={handleSave} loading={isSaving} disabled={isBusy}>
          保存
        </Button>
        <Button onClick={() => setSaveAsOpen(true)} disabled={isBusy}>
          另存为
        </Button>
        <Button onClick={() => setLoadOpen(true)} disabled={isBusy}>
          加载
        </Button>
        <Button onClick={handleExport} disabled={isBusy}>
          导出
        </Button>
        <Button onClick={handleExportCode} disabled={isBusy}>
          导出代码
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
          导入
        </Button>
      </Space>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleImport(file).catch(() => undefined);
          }
          const input = event.target as HTMLInputElement;
          input.value = '';
        }}
      />

      <Modal
        open={saveAsOpen}
        title="另存为"
        onOk={handleSaveAs}
        okText="保存"
        cancelText="取消"
        onCancel={() => setSaveAsOpen(false)}
        confirmLoading={isCreating}
      >
        <Input
          value={saveAsName}
          onChange={(event) => setSaveAsName(event.target.value)}
          placeholder="项目名称"
        />
      </Modal>

      <Modal open={loadOpen} title="加载项目" onCancel={() => setLoadOpen(false)} footer={null}>
        <List
          size="small"
          header={listHeader}
          dataSource={projects}
          loading={isFetching}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="load" type="link" onClick={() => handleLoadProject(item.id)}>
                  加载
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  danger
                  onClick={() => handleDeleteProject(item.id)}
                >
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={item.updatedAt ? new Date(item.updatedAt).toLocaleString() : undefined}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Space>
  );
};
