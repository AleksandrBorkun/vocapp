import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box component="header" sx={{ p: { xs: 2, sm: 3 } }}>
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              fontSize: { xs: "1.5rem", sm: "1.875rem" },
            }}
          >
            VocApp
          </Typography>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1,
                bgcolor: "primary.main",
                color: "text.primary",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "secondary.main",
                },
              }}
            >
              Login
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 6, sm: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 3,
              fontSize: { xs: "2.5rem", sm: "3rem", md: "3.75rem" },
            }}
          >
            Learn New Words
            <Typography
              component="span"
              sx={{
                display: "block",
                color: "primary.main",
                mt: 1,
              }}
            >
              The Smart Way
            </Typography>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "secondary.main",
              mb: { xs: 4, sm: 6 },
              maxWidth: "42rem",
              mx: "auto",
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
            }}
          >
            Create custom flashcard sets and master new vocabulary at your own
            pace. Perfect for students, language learners, and anyone expanding
            their knowledge.
          </Typography>

          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: { xs: 4, sm: 6 },
                py: { xs: 1.5, sm: 2 },
                bgcolor: "primary.main",
                color: "text.primary",
                fontSize: { xs: "1.125rem", sm: "1.25rem" },
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "secondary.main",
                },
              }}
            >
              Get Started
            </Button>
          </Link>
        </Container>

        {/* Features */}
        <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 12 }, width: "100%" }}>
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  p: { xs: 3, sm: 4 },
                  borderRadius: 2,
                  border: 1,
                  borderColor: "secondary.main",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, mb: 2 }}
                  >
                    📚
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                      fontSize: { xs: "1.125rem", sm: "1.25rem" },
                    }}
                  >
                    Create Card Sets
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "secondary.main",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Build your own flashcard collections for any subject or
                    language
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  p: { xs: 3, sm: 4 },
                  borderRadius: 2,
                  border: 1,
                  borderColor: "secondary.main",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, mb: 2 }}
                  >
                    🧠
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                      fontSize: { xs: "1.125rem", sm: "1.25rem" },
                    }}
                  >
                    Study Anytime
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "secondary.main",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Practice on any device with our mobile-friendly interface
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  p: { xs: 3, sm: 4 },
                  borderRadius: 2,
                  border: 1,
                  borderColor: "secondary.main",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, mb: 2 }}
                  >
                    📈
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                      fontSize: { xs: "1.125rem", sm: "1.25rem" },
                    }}
                  >
                    Track Progress
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "secondary.main",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Monitor your learning journey and master new words
                    efficiently
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          p: 3,
          textAlign: "center",
          color: "secondary.main",
          borderTop: 1,
          borderColor: "secondary.main",
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          © 2026 VocApp. Learn smarter, not harder.
        </Typography>
      </Box>
    </Box>
  );
}
