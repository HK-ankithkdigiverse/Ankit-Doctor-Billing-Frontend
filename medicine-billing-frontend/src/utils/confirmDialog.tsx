import { App } from "antd";

type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export const useConfirmDialog = () => {
  const { modal } = App.useApp();

  return ({
    title,
    message,
    confirmText = "Confirm",
    danger = false,
    onConfirm,
  }: ConfirmDialogOptions) => {
    modal.confirm({
      title,
      content: message,
      centered: true,
      maskClosable: false,
      okText: confirmText,
      cancelText: "Cancel",
      okButtonProps: danger ? { danger: true } : undefined,
      styles: {
        mask: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(2px)",
        },
      },
      onOk: onConfirm,
    });
  };
};
