import React, { useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const SeatingChart = () => {
  const [seatingLayout, setSeatingLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [ticketPrice, setTicketPrice] = useState(0);
  const [movieTitle, setMovieTitle] = useState("");
  const [movieImage, setMovieImage] = useState("");
  const { showtimeId } = useParams();
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      try {
        // Fetch showtime details including movieId
        const showtimeResponse = await axios.get(`/showtimes/${showtimeId}`);
        const { rows, cols, seats_booked, movieid, price } =
          showtimeResponse.data;
        setSeatingLayout({ rows, cols, seats_booked });
        setTicketPrice(price); // Set ticket price from API response

        // Fetch movie details
        if (movieid) {
          const movieResponse = await axios.get(`/movies/${movieid}`);
          setMovieTitle(movieResponse.data.movieName);
          setMovieImage(movieResponse.data.img)
        }
        
      } catch (error) {
        console.error("Error fetching showtime and movie data:", error);
      }
    };

    fetchShowtimeDetails();
  }, [showtimeId]);

  const handleSeatClick = (seatId) => {
    const updatedSelectedSeats = new Set(selectedSeats);
    if (updatedSelectedSeats.has(seatId)) {
      updatedSelectedSeats.delete(seatId);
    } else {
      updatedSelectedSeats.add(seatId);
    }
    setSelectedSeats(updatedSelectedSeats);
  };
  const handleProceedToPayment = () => {
    const selectedSeatsArray = Array.from(selectedSeats);
    const serviceFee = 1.5; // Service fee
    const totalCost = (selectedSeatsArray.length * ticketPrice) + serviceFee;
  
    navigate("/payment-overview", { // Ensure this route is correct
      state: {
        movieTitle,
        movieImage, // Ensure you have the image URL from the movie state
        selectedSeats: selectedSeatsArray,
        totalCost, // This now includes the service fee
      },
    });
  };
  const renderSeats = () => {
    if (!seatingLayout) return null;
    let seats = [];
    for (let row = 0; row < seatingLayout.rows; row++) {
      let rowSeats = [];
      for (let col = 0; col < seatingLayout.cols; col++) {
        const seatId = `${String.fromCharCode(65 + row)}${(col + 1)
          .toString()
          .padStart(2, "0")}`;
        const isBooked = seatingLayout.seats_booked.includes(seatId);
        const isSelected = selectedSeats.has(seatId);

        rowSeats.push(
          <button
            key={seatId}
            disabled={isBooked}
            className={`seat ${isSelected ? "selected" : ""} ${
              isBooked ? "booked" : ""
            }`}
            onClick={() => handleSeatClick(seatId)}
          >
            {seatId}
          </button>
        );
      }
      seats.push(
        <div key={`row-${row}`} className="seat-row">
          {rowSeats}
        </div>
      );
    }
    return seats;
  };

  const renderSelectedSeatsSummary = () => {
    const selectedSeatsArray = Array.from(selectedSeats);
    const totalCost = (selectedSeatsArray.length * ticketPrice)+1.5;

    return (
      <div className="selected-seats-summary">
        <p>Selected Seats: {selectedSeatsArray.join(", ")}</p>
        <p>Total Seats: {selectedSeatsArray.length}</p>
        <p>Service Fee: $1.50</p>
        <p>Total Cost: ${totalCost.toFixed(2)}</p>
      </div>
    );
  };

  return (
    <>
      <div className="seating-chart-container">
        <h1>{movieTitle}</h1>
        <div className="seating-chart">{renderSeats()}</div>
        {renderSelectedSeatsSummary()}
        <button
          className="proceed-to-payment-button"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      </div>
    </>
  );
};

export default SeatingChart;