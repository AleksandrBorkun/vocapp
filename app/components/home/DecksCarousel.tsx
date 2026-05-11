"use client";

import { Box, Button, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Deck } from "@/lib/types";
import DeckCard from "./DeckCard";

interface DecksCarouselProps {
  decks: Deck[];
  onStudyDeck: (deck: Deck) => void;
  onAddWords: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onCreateDeck: () => void;
  onScanPicture: (deck: Deck, file: File) => void;
}

export default function DecksCarousel({
  decks,
  onStudyDeck,
  onAddWords,
  onDeleteDeck,
  onCreateDeck,
  onScanPicture,
}: DecksCarouselProps) {
  return (
    <Box
      sx={{
        maxWidth: "600px",
        mx: "auto",
        pb: 8,
        "& .swiper": {
          pb: 6,
        },
        "& .swiper-pagination": {
          bottom: "0 !important",
        },
        "& .swiper-pagination-bullet": {
          width: "10px",
          height: "10px",
          backgroundColor: "secondary.main",
          opacity: 1,
        },
        "& .swiper-pagination-bullet-active": {
          backgroundColor: "primary.main",
        },
      }}
    >
      <Swiper
        modules={[Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        centeredSlides={true}
      >
        {decks.map((deck: Deck) => (
          <SwiperSlide key={deck.id}>
            <DeckCard
              deck={deck}
              onStudy={onStudyDeck}
              onAddWords={onAddWords}
              onDelete={onDeleteDeck}
              onScanPicture={onScanPicture}
            />
          </SwiperSlide>
        ))}

        {/* Create New Deck Card */}
        <SwiperSlide>
          <Button
            onClick={onCreateDeck}
            sx={{
              bgcolor: "background.paper",
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              height: "80vh",
              width: "100%",
              border: 2,
              borderStyle: "dashed",
              borderColor: "grey.300",
              "&:hover": {
                boxShadow: 6,
                borderColor: "primary.main",
              },
              "&:hover .add-icon": {
                transform: "scale(1.1)",
              },
            }}
          >
            <Box
              className="add-icon"
              sx={{
                fontSize: "3rem",
                mb: 2,
                transition: "transform 0.2s",
              }}
            >
              ➕
            </Box>
            <Typography
              variant="h6"
              fontWeight={600}
              color="grey.800"
              mb={1}
              sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
            >
              Create New Deck
            </Typography>
            <Typography variant="body2" color="grey.600">
              Build a new vocabulary deck
            </Typography>
          </Button>
        </SwiperSlide>
      </Swiper>
    </Box>
  );
}
