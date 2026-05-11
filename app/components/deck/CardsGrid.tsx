import { getTranslation } from "@/lib/translations";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { H2 } from "../common/Headers";
import { Word } from "@/lib/types";
import WordCard from "./WordCard";

const CardsGridWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1em;
`;

const FlexColumn = styled.div`
  padding-top: 1em;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 0.5em;
`;

type CardsGridComponentProps = {
  cards: Word[];
  handleEditWord: (index: number, word: Word) => void;
};

export const CardsGridComponent = (props: CardsGridComponentProps) => {
  return (
    <CardsGridWrapper>
      <H2 text={getTranslation("deck.cards")} />
      <FlexColumn>
        {props.cards.map((word, index) => (
          <WordCard
            word={word}
            index={index}
            showTranslation={true}
            onToggleTranslation={(index: number) => {}}
            onEdit={props.handleEditWord}
            key={index}
          />
        ))}
      </FlexColumn>
    </CardsGridWrapper>
  );
};
