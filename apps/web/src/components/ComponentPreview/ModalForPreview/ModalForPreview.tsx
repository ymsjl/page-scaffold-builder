import React from "react";
import { Modal, ModalProps } from "antd";

interface ModalForPreviewProps extends React.ComponentProps<typeof Modal> {
}

const ModalForPreview: React.FC<ModalForPreviewProps> = React.memo((props) => {
  const mergedProps = React.useMemo<ModalProps>(() => ({
    getContainer: () => document.getElementById("modal-preview-root") || document.body,
    styles: {
      mask: { position: "absolute" },
      wrapper: { position: "absolute" },
    },
    ...props,
  }), [props]);

  return (
    <Modal {...mergedProps} >
    </Modal>
  );
});

ModalForPreview.displayName = "ModalForPreview";

export default ModalForPreview;