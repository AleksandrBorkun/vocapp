import theme from "@/lib/theme";
import { getTranslation } from "@/lib/translations";
import { Word } from "@/lib/types";
import styled from "@emotion/styled";
import { TextField, Typography } from "@mui/material";
import { H1, H6, Span } from "../common/Headers";

const SearchField = styled(TextField)`
  width: 100%;
  color: ${theme.palette.primary.main};
  input {
    color: ${theme.palette.primary.main};
  }

  div fieldset {
    border-color: ${theme.palette.primary.main};
  }
`;

const HeaderHolderWrapper = styled.div`
  padding: 0 1em 1em 1em;
  background-color: ${theme.palette.primary.light};
  height: 300px;
  border-radius: 0 0 10px 10px;
  display: grid;
  grid-template-rows: 1fr 2fr;
`;

const TitleTextHolder = styled.div``;

// TODO: maybe use Provider to store words??
type HeaderHolderProps = {
  title: string;
  breadcrumbs?: string;
  description?: string;
  cards: Word[];
};

const StackSearchHolder = styled.div`
  display: flex;
  flex-direction: column;
`;
export const HeaderHolder = (props: HeaderHolderProps) => {
  return (
    <HeaderHolderWrapper>
      <TitleTextHolder>
        {props.breadcrumbs && <H6 dark={false} text={props.breadcrumbs} />}
        <H1 dark={false} text={props.title} />
      </TitleTextHolder>
      <StackSearchHolder>
        <SearchField
          fullWidth
          id="search-field"
          label="Search"
          InputLabelProps={{ sx: { color: theme.palette.primary.main } }}
        />
        <Span
          dark={false}
          text={`${props.cards.length} ${getTranslation("deck.header.cardsAdded")}`}
          sx={{
            textAlign: "end",
            marginTop: "auto",
          }}
        />
      </StackSearchHolder>
    </HeaderHolderWrapper>
  );
};
