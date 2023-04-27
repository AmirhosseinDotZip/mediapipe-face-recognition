import { FaceMesh } from "@mediapipe/face_mesh";
import { useRef, useEffect, useCallback } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { drawConnectors } from "@mediapipe/drawing_utils";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMesh = useRef(null);
  const camera = useRef(null);

  const onResults = useCallback((results) => {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        });
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
        });
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
        });
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#30FF30",
        });
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
        });
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
        });
        drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
        });
      }
    }
    canvasCtx.restore();
  }, []);

  useEffect(() => {
    faceMesh.current = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.current.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.current.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.current.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.current.start();
    }
  }, [onResults]);

  return (
    <center>
      <div className="App">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </div>
    </center>
  );
}

export default App;
