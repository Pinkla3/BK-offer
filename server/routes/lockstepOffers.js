const express = require("express");
const router = express.Router();
const { getAllOffers, getOfferBySlug } = require("../modules/lockstepApi");

// Endpoint do pobierania wszystkich ofert
router.get("/", async (req, res) => {
  try {
    const offers = await getAllOffers();
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint do pobierania pojedynczej oferty na podstawie slug
router.get("/:slug", async (req, res) => {
  try {
    const offer = await getOfferBySlug(req.params.slug);
    res.status(200).json(offer);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;