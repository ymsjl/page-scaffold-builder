import React, { useEffect } from 'react';
import type { FormInstance } from 'antd';

import type { EntityModel } from '@/types';

export function useSyncFormOnModalOpen(params: {
  isOpen: boolean;
  editingEntityModel: EntityModel | null | undefined;
  form: FormInstance<EntityModel>;
}) {
  const { isOpen, editingEntityModel, form } = params;
  const isOpenPrevRef = React.useRef(isOpen);

  useEffect(() => {
    if (isOpen && !isOpenPrevRef.current) {
      form.setFieldsValue({ ...(editingEntityModel ?? undefined) });
    }
  }, [isOpen, editingEntityModel, form]);

  useEffect(() => {
    isOpenPrevRef.current = isOpen;
  }, [isOpen]);
}
