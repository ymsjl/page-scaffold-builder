import React from 'react';
import { Table } from 'antd';

export default function ProTableGenerate(props: any) {
  const { columns = [], dataSource = [], headerTitle } = props;
  return (
    <div style={{ padding: 12, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6 }}>
      {headerTitle && <div style={{ fontWeight: 600, marginBottom: 12 }}>{headerTitle}</div>}
      <Table columns={columns} dataSource={dataSource} pagination={false} />
    </div>
  );
}
