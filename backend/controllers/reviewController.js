import Review from "../models/Review.js";


// ===============================
// Add Review
// ===============================
export const createReview = async (req, res) => {
  try {

    const userId = req.user.id;

    const { rating, comment } = req.body;


    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }


    const review = await Review.create({
      user_id: userId,
      rating,
      comment,
    });


    res.status(201).json({
      message: "Review added successfully",
      review,
    });


  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// ===============================
// Get all reviews
// ===============================
export const getReviews = async (req, res) => {
  try {

    const reviews = await Review.find()
      .populate("user_id", "full_name")
      .sort({ createdAt: -1 });


    res.json({
      reviews,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};