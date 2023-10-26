import { useRef, useState, useEffect } from "react";
import Card from "react-bootstrap/Card";

import { useReward } from "react-rewards";
import FrontImage from "../assets/scratch.webp";
import BackImage from "../assets/afterscratch.webp";

const scratchRadius = 20;
const lineWidth = 10;
let lastCalculationTime = 0;

// eslint-disable-next-line react/prop-types
const ScratchPad = ({ scratchMessage }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedArea, setScratchedArea] = useState(0);

  const { reward } = useReward("rewardId", "confetti");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = FrontImage;

    img.onload = () => {
      const adjustCanvasSize = () => {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        clearCanvas();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };

      adjustCanvasSize();
      window.addEventListener("resize", adjustCanvasSize);

      // Touch event handling
      canvas.addEventListener("touchstart", handleTouchStart);
      canvas.addEventListener("touchmove", handleTouchMove);
      canvas.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("resize", adjustCanvasSize);
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
      };
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Rest of your code...
  }, []);

  const handleMouseDown = () => {
    setIsScratching(true);
  };

  const handleMouseMove = (e) => {
    if (isScratching) {
      scratch(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    scratch(
      touch.clientX - canvasRef.current.getBoundingClientRect().left,
      touch.clientY - canvasRef.current.getBoundingClientRect().top
    );
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    scratch(
      touch.clientX - canvasRef.current.getBoundingClientRect().left,
      touch.clientY - canvasRef.current.getBoundingClientRect().top
    );
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = lineWidth;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, scratchRadius, 0, 2 * Math.PI);
    ctx.fill();

    if (Date.now() - lastCalculationTime >= 100) {
      lastCalculationTime = Date.now();
      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
      const transparentPixels = Array.from(imageData).filter(
        (value, index) => (index + 1) % 4 === 0
      );
      const transparentPixelCount = transparentPixels.filter(
        (value) => value === 0
      ).length;
      const totalPixels = transparentPixels.length;
      const areaPercent = (transparentPixelCount / totalPixels) * 100;
      setScratchedArea(areaPercent);
      if (areaPercent >= 50) {
        reward();
        reward();
      }
    }
  };

  return (
    <div className="d-flex align-items-center h-100">
      <div className="m-auto" onClick={(e) => e.stopPropagation()}>
        <div
          ref={containerRef}
          className="ScratchCard__Container position-relative m-auto rounded-4 shadow"
          id="rewardId"
        >
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="ScratchCard__Canvas position-absolute top-0 z-3 start-0 rounded-4 shadow"
            style={{ display: scratchedArea >= 50 ? "none" : "block" }}
          ></canvas>
          
          {scratchedArea >= 2 && (
            <Card className="ScratchCard__Result w-100 h-100 cursor-grabbing shadow border-0 position-relative rounded-4">
              <img
                src={BackImage}
                alt="Price Img"
                className="w-100 h-100 rounded-4"
              />
              <div className="reward-text position-absolute w-100 h-100 top-0 d-flex flex-column align-items-center justify-content-center">
                <h3 className="fw-bold text-uppercase m-0">
                  {scratchMessage ? (
                    <span>{scratchMessage}</span>
                  ) : (
                    <> ! you win !</>
                  )}
                </h3>
                {!scratchMessage && (
                  <h2
                    className="fw-bold text-uppercase m-0"
                    style={{ color: "red" }}
                  >
                    ₹ 2
                  </h2>
                )}
              </div>
            </Card>
          )}
        </div>
        <h3 className="mt-3 text-white fade-in-text">
          Scratch & Win <br /> Upto ₹20{" "}
        </h3>
      </div>
    </div>
  );
};

export default ScratchPad;
