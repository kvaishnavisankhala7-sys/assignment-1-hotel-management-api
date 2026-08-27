const express = require("express");
const router = express.Router();

const { hotels } = require("./db");

// GET /hotels
router.get("/", (req, res) => {
  res.json(hotels);
});

// GET /hotels/:id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const hotel = hotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({
      message: "Hotel not found",
    });
  }

  res.json(hotel);
});

// POST /hotels
router.post("/", (req, res) => {
  const { name, location, rating, pricePerNight } = req.body;

  if (!name || !location || rating === undefined || pricePerNight === undefined) {
    return res.status(400).json({
      message: "All hotel fields are required",
    });
  }

  const newHotel = {
    id: hotels.length > 0 ? hotels[hotels.length - 1].id + 1 : 1,
    name,
    location,
    rating,
    pricePerNight,
  };

  hotels.push(newHotel);

  res.status(201).json({
    message: "Hotel added successfully",
    hotel: newHotel,
  });
});

// PUT /hotels/:id
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const hotel = hotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({
      message: "Hotel not found",
    });
  }

  const { name, location, rating, pricePerNight } = req.body;

  hotel.name = name ?? hotel.name;
  hotel.location = location ?? hotel.location;
  hotel.rating = rating ?? hotel.rating;
  hotel.pricePerNight = pricePerNight ?? hotel.pricePerNight;

  res.json({
    message: "Hotel updated successfully",
    hotel,
  });
});

// DELETE /hotels/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = hotels.findIndex((h) => h.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Hotel not found",
    });
  }

  const deletedHotel = hotels.splice(index, 1);

  res.json({
    message: "Hotel deleted successfully",
    hotel: deletedHotel[0],
  });
});

module.exports = router;