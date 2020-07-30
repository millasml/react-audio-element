import React, {useState} from "react";

const MyReactApp = props => {
  const { width, height, bgColor, content } = props;
//   const [state, setState] = useState(null);
  return (
    <div
      style = {{
        width: width || 200,
        height: height || 200,
        backgroundColor: bgColor || "blue",
		color:  "black"
      }}
    >
      {content}
    </div>
  );
};

export default MyReactApp;