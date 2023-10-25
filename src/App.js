import React, { useEffect, useRef } from 'react';
import {detectAllFaces} from 'face-api.js';
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const hatImageRef = useRef(null);

  useEffect(() => {
    const startFaceDetection = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      

      const videoEl = webcamRef.current.video;
      const canvas = canvasRef.current;
      canvas.width = videoEl.width;
      canvas.height = videoEl.height;

      const context = canvas.getContext('2d');

      setInterval(async () => {
        const detections = await detectAllFaces(videoEl).withFaceLandmarks();
        context.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach((detection) => {
          const hatImage = hatImageRef.current;

          // Уберите display: none, чтобы изображение кепки было видимым
          hatImage.style.display = 'block';

          // Установите абсолютное позиционирование для кепки
          hatImage.style.position = 'absolute';

          const landmarks = detection.landmarks;
          const leftEyeBrow = landmarks.getLeftEyeBrow();
          const rightEyeBrow = landmarks.getRightEyeBrow();

          const leftPoint = leftEyeBrow[0];
          const rightPoint = rightEyeBrow.splice(-1)[0];
          const width = (rightPoint.x - leftPoint.x)*2;

          // Определите ширину кепки
          // const hatWidth = Math.abs(leftEyeBrow[0]._x - rightEyeBrow[rightEyeBrow.length - 1]._x);


          // const centerX = (rightEyeBrow[0]._x + leftEyeBrow[leftEyeBrow.length - 1]._x) / 2;
          // const centerY = (rightEyeBrow[0]._y + leftEyeBrow[leftEyeBrow.length - 1]._y) / 2 
          // console.log(width);

          hatImage.style.width = width + 'px';
          hatImage.style.left =  (leftPoint.x - width * 0.10) - 10 + 'px';
          hatImage.style.top = (leftEyeBrow[0].y - width * 0.55) + 'px';

          context.drawImage(hatImage, 0, 0, canvas.width, canvas.height);
        });
      }, 100);
    };

    startFaceDetection();
  }, []);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        mirrored={false}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 1,
        }}
      />
      <canvas ref={canvasRef} />
      <img
        ref={hatImageRef}
        src="images/overlay-cap.png" // Путь к изображению кепки
        className='cap'
        alt="Hat"
        style={{
          zIndex: 100,
        }}
      />
    </div>
  );
};

export default App;