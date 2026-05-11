import theme from "@/lib/theme";
import { Typography, TypographyProps } from "@mui/material";

type HeaderProps = TypographyProps & {
  text: string;
  dark?: boolean;
};

const DefaultTextComponent = ({
  text,
  dark = true,
  ...otherProps
}: HeaderProps) => {
  return (
    <Typography
      color={dark ? theme.palette.text.primary : theme.palette.primary.main}
      {...otherProps}
    >
      {text}
    </Typography>
  );
};

export const H1 = (props: HeaderProps) => (
  <DefaultTextComponent variant={"h3"} component={"h1"} {...props} />
);

export const H2 = (props: HeaderProps) => (
  <DefaultTextComponent variant={"h3"} component={"h2"} {...props} />
);

export const H4 = (props: HeaderProps) => (
  <DefaultTextComponent variant={"h4"} component={"h4"} {...props} />
);

export const H6 = (props: HeaderProps) => (
  <DefaultTextComponent variant={"h6"} component={"h4"} {...props} />
);

export const Span = (props: HeaderProps) => <DefaultTextComponent {...props} />;
