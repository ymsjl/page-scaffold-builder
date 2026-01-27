import ComponentPreview from './components/ComponentPreview';
import React from 'react';
import { Layout } from 'antd';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';

const styles: { [key: string]: React.CSSProperties } = {
  builder: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e8e8e8',
    background: 'white',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 500,
  },
  contentLayout: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contentInner: {
    flex: 1,
    overflow: 'hidden',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 500,
  },
};
export function PageScaffoldBuilderPreview() {
  return (
    <>
      <Layout.Content style={styles.content}>
        <Layout.Header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={styles.headerTitle}>页面脚手架构建器</h2>
          </div>
        </Layout.Header>

        <Layout.Content style={{ height: '100%', overflow: 'hidden' }}>
          <ComponentPreview />
        </Layout.Content>
      </Layout.Content>

      <Layout.Sider width={300} trigger={null} style={{ background: 'white', borderLeft: '1px solid #e8e8e8' }}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>属性面板</h3>
          <PropertyPanel />
        </div>
      </Layout.Sider>
    </>
  );
}
