import { Dialog, DialogProps, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, ReactElement } from "react";
import { dialogStyles } from "@/lib/constants/styles";

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface AppDialogProps extends Omit<DialogProps, "PaperProps"> {
  children: React.ReactNode;
  mobileFullScreen?: boolean;
}

/**
 * Standardized dialog component with consistent styling
 * Supports mobile full-screen mode and slide transition
 */
export default function AppDialog({
  children,
  mobileFullScreen = false,
  ...props
}: AppDialogProps) {
  return (
    <Dialog
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: mobileFullScreen
          ? dialogStyles.mobileFullScreen
          : dialogStyles.paper,
      }}
      {...props}
    >
      {children}
    </Dialog>
  );
}
