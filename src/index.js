import React, { useState, useEffect, useRef } from "react";
import "./index.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faPlay,
  faPause,
  faStepForward,
  faStepBackward,
} from "@fortawesome/free-solid-svg-icons";

//cannot add padding to the canvas element

export default function AudioPlayer(props) {
  const {
    className,
    timestamps,
    src,
    overrideStyles,
    classNames,
    skipSeconds,
    showHours,
    sliderTop,
    colors,
  } = props;

  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const timeToXPos = (time) => {
    const fraction = time / duration;
    return fraction * width;
  };

  const xPosToTime = (xPos) => {
    return (xPos * duration) / width;
  };

  const convertTohhMMss = (seconds) => {
    if (showHours) {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    } else {
      return new Date(seconds * 1000).toISOString().substr(14, 5);
    }
  };

  const getSliderTrackRect = () => {
    return {
      x: 0,
      y: 0,
      width: width,
      height: height,
    };
  };

  const getSliderRect = (time) => {
    return {
      x: 0,
      y: 0,
      width: timeToXPos(time),
      height: height,
    };
  };

  const drawSliderTrack = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ebedf0";
    if (colors && colors.sliderTrack) {
      context.fillStyle = colors.sliderTrack;
    }
    const sliderTrackRect = getSliderTrackRect();
    context.fillRect(
      sliderTrackRect.x,
      sliderTrackRect.y,
      sliderTrackRect.width,
      sliderTrackRect.height
    );
  };

  const drawTimestamps = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    timestamps.forEach((timestamp) => {
      if (timestamp.color) {
        context.fillStyle = timestamp.color;
      } else if (colors && colors.timestamps) {
        context.fillStyle = colors.timestamps;
      } else {
        context.fillStyle = "#ffd900";
      }
      context.fillRect(
        timeToXPos(timestamp.startTime),
        0,
        Math.max(1, timeToXPos(timestamp.endTime - timestamp.startTime)),
        height
      );
    });
  };

  const drawSlider = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const sliderRect = getSliderRect(time);

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(37, 24, 126, 1)");
    gradient.addColorStop(0.47, "rgba(55, 125, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 171, 195, 1)");
    context.fillStyle = gradient;
    if (colors && colors.slider) {
      context.fillStyle = colors.slider;
    }

    context.fillRect(
      sliderRect.x,
      sliderRect.y,
      sliderRect.width,
      sliderRect.height
    );
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);
  };

  useEffect(() => {
    audioRef.current.addEventListener(
      "timeupdate",
      (e) => {
        setTime(e.target.currentTime);
      },
      true
    );
    audioRef.current.addEventListener("pause", () => {
      setIsPaused(true);
    });
    audioRef.current.addEventListener("play", () => {
      setIsPaused(false);
    });
    audioRef.current.addEventListener("durationchange", (e) => {
      setDuration(e.target.duration);
    });
  }, []);

  //update size of canvas to match that of css
  useEffect(() => {
    const canvas = canvasRef.current;
    const width_client = canvas.clientWidth;
    const height_client = canvas.clientHeight;

    if (canvas.width !== width_client || canvas.height !== height_client) {
      canvas.width = width_client;
      canvas.height = height_client;
      setWidth(canvas.width);
      setHeight(canvas.height);
    }
  }, [canvasRef]);

  //draw the slider track
  useEffect(() => {
    if (width && height) {
      drawSliderTrack();
    }
  }, [width, height]);

  useEffect(() => {
    if (timestamps) {
      drawTimestamps();
    }
  }, [timestamps]);

  useEffect(() => {
    clear();
    drawSliderTrack();
    if (timestamps) {
      drawTimestamps();
    }
    drawSlider();
  });

  //Function to get the mouse position
  const getMousePos = (event) => {
    var rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  //Function to check whether a point is inside a rectangle
  const isInside = (pos, rect) => {
    return (
      pos.x > rect.x &&
      pos.x < rect.x + rect.width &&
      pos.y < rect.y + rect.height &&
      pos.y > rect.y
    );
  };

  const handleClick = (e) => {
    const mousePos = getMousePos(e);

    if (isInside(mousePos, getSliderTrackRect())) {
      audioRef.current.currentTime = xPosToTime(mousePos.x);
    }
  };

  return (
    <div className={`${className ? className : ""} react-audio-element`}>
      {sliderTop && (
        <div className="time-track">
          <div
            className={`${overrideStyles ? "" : "time-text"} ${
              classNames && classNames.timeText ? classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(time)}
          </div>
          <canvas
            className={`${overrideStyles ? "" : "slider-track"} ${
              classNames && classNames.sliderTrack ? classNames.sliderTrack : ""
            }`}
            ref={canvasRef}
            onClick={handleClick}
          ></canvas>
          <div
            className={`${overrideStyles ? "" : "time-text"} ${
              classNames && classNames.timeText ? classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(duration)}
          </div>
        </div>
      )}
      <div className="controls">
        <div
          className={`${overrideStyles ? "" : "control-button"} ${
            classNames && classNames.controlButton
              ? classNames.controlButton
              : ""
          }`}
          onClick={() => {
            try {
              audioRef.current.currentTime -= skipSeconds ? skipSeconds : 10.0;
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <FontAwesomeIcon icon={faStepBackward} />
        </div>
        <div
          className={`${overrideStyles ? "" : "control-button play-pause"} ${
            classNames && classNames.controlButton
              ? classNames.controlButton
              : ""
          } ${classNames && classNames.playPause ? classNames.playPause : ""}`}
          onClick={() => {
            if (isPaused) {
              audioRef.current.play();
            } else {
              audioRef.current.pause();
            }
          }}
        >
          {isPaused ? (
            <FontAwesomeIcon icon={faPlay} />
          ) : (
            <FontAwesomeIcon icon={faPause} />
          )}
        </div>
        <div
          className={`${overrideStyles ? "" : "control-button"} ${
            classNames && classNames.controlButton
              ? classNames.controlButton
              : ""
          }`}
          onClick={() => {
            try {
              audioRef.current.currentTime += skipSeconds ? skipSeconds : 10.0;
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <FontAwesomeIcon icon={faStepForward} />
        </div>
      </div>
      {!sliderTop && (
        <div className="time-track">
          <div
            className={`${overrideStyles ? "" : "time-text"} ${
              classNames && classNames.timeText ? classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(time)}
          </div>
          <canvas
            className={`${overrideStyles ? "" : "slider-track"} ${
              classNames && classNames.sliderTrack ? classNames.sliderTrack : ""
            }`}
            ref={canvasRef}
            onClick={handleClick}
          ></canvas>
          <div
            className={`${overrideStyles ? "" : "time-text"} ${
              classNames && classNames.timeText ? classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(duration)}
          </div>
        </div>
      )}
      <audio ref={audioRef} src={src ? src : ""}></audio>
    </div>
  );
}
