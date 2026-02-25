import { lazyLoad } from './componentRegistry';

export const preloadComponents = async () => {
  await Promise.all([
    lazyLoad(
      'ProTableForPreview',
      () => import('@/components/ComponentPreview/ProTableForPreview/ProTableForPreview'),
    ),
    lazyLoad(
      'ProTableForPurePreview',
      () => import('@/components/ComponentPreview/ProTableForPreview/ProTableForPurePreview'),
    ),
    lazyLoad(
      'PageForPreview',
      () => import('@/components/ComponentPreview/PageForPreview/PageForPreview'),
    ),
    lazyLoad(
      'CardForPreview',
      () => import('@/components/ComponentPreview/CardForPreview/CardForPreview'),
    ),
    lazyLoad(
      'ModalForPreview',
      () => import('@/components/ComponentPreview/ModalForPreview/ModalForPreview'),
    ),
    lazyLoad('Button', () => import('antd').then((m) => ({ default: m.Button }))),
    lazyLoad('ProDescriptions', () =>
      import('@ant-design/pro-components').then((m) => ({ default: m.ProDescriptions })),
    ),
    lazyLoad('BetaSchemaFormForPreview', () =>
      import(
        '@/components/ComponentPreview/BetaSchemaFormForPreview/BetaSchemaFormForPreview'
      ),
    ),
  ]);
};
