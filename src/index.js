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
    if (props.showHours) {
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
    if (props.colors.sliderTrack) {
      context.fillStyle = props.colors.sliderTrack;
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

    props.timestamps.forEach((timestamp) => {
      if (timestamp.color) {
        context.fillStyle = timestamp.color;
      } else if (props.color.timestamps) {
        context.fillStyle = props.color.timestamps;
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
    if (props.colors.slider) {
      context.fillStyle = props.colors.slider;
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
    drawTimestamps();
  }, [props.timestamps]);

  useEffect(() => {
    clear();
    drawSliderTrack();
    drawTimestamps();
    drawSlider();
  }, [time]);

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
    <div className={`${props.className ? props.className : ""} audio-player`}>
      {props.sliderTop && (
        <div className="time-track">
          <div
            className={`${props.overrideStyles ? "" : "time-text"} ${
              props.classNames.timeText ? props.classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(time)}
          </div>
          <canvas
            className={`${props.overrideStyles ? "" : "slider-track"} ${
              props.classNames.sliderTrack ? props.classNames.sliderTrack : ""
            }`}
            ref={canvasRef}
            onClick={handleClick}
          ></canvas>
          <div
            className={`${props.overrideStyles ? "" : "time-text"} ${
              props.classNames.timeText ? props.classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(duration)}
          </div>
        </div>
      )}
      <div className="controls">
        <div
          className={`${props.overrideStyles ? "" : "control-button"} ${
            props.classNames.controlButton ? props.classNames.controlButton : ""
          }`}
          onClick={() => {
            try {
              audioRef.current.currentTime -= props.skipSeconds
                ? props.skipSeconds
                : 10.0;
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <FontAwesomeIcon icon={faStepBackward} />
        </div>
        <div
          className={`${
            props.overrideStyles ? "" : "control-button play-pause"
          } ${
            props.classNames.controlButton ? props.classNames.controlButton : ""
          } ${props.classNames.playPause ? props.classNames.playPause : ""}`}
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
          className={`${props.overrideStyles ? "" : "control-button"} ${
            props.classNames.controlButton ? props.classNames.controlButton : ""
          }`}
          onClick={() => {
            try {
              audioRef.current.currentTime += props.skipSeconds
                ? props.skipSeconds
                : 10.0;
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <FontAwesomeIcon icon={faStepForward} />
        </div>
      </div>
      {!props.sliderTop && (
        <div className="time-track">
          <div
            className={`${props.overrideStyles ? "" : "time-text"} ${
              props.classNames.timeText ? props.classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(time)}
          </div>
          <canvas
            className={`${props.overrideStyles ? "" : "slider-track"} ${
              props.classNames.sliderTrack ? props.classNames.sliderTrack : ""
            }`}
            ref={canvasRef}
            onClick={handleClick}
          ></canvas>
          <div
            className={`${props.overrideStyles ? "" : "time-text"} ${
              props.classNames.timeText ? props.classNames.timeText : ""
            }`}
          >
            {convertTohhMMss(duration)}
          </div>
        </div>
      )}
      <audio ref={audioRef} src={props.src}></audio>
    </div>
  );
}
