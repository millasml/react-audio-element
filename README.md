# React Audio Element

Styling the embedded audio element is limited. According to MDN,

> You can style the default controls with properties that affect the block as a single unit, so for example you can give it a border and border-radius, padding, margin, etc. You can't however style the individual components inside the audio player (e.g. change the button size or icons, change the font, etc.), and the controls are different across the different browsers.

This component

## Usage

```
import React, { Component} from 'react';
import AudioPlayer from 'react-audio-element';
 
export default class Example extends Component {
  render() {
        return (
            <AudioPlayer
                className = "audio-playa"
                timestamps={[]}
                src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                colors = {{sliderTrack : "black", slider : "green", timestamps: "red"}}
                overrideStyles = {false}
                classNames = {
                { controlButton : "custom-control",
                    playPause: "custom-play-pause" ,
                    timeText: "custom-time-text",
                    sliderTrack : "custom-slider-track"
                }
                }
                skipSeconds = {20}
                showHours = {true}
                sliderTop = {true}
            />
        );
     }
}
```

## Props
| Name   |      Type      |  Default | Description |
|----------|-------------|------| -|
| src (required) |  string | $1600 |  |
| timestamps |    centered   |   $12 |   |
| colors | right-aligned |    $1 |   |
