   // Copyright 2019 Niels Pichon

   // Licensed under the Apache License, Version 2.0 (the "License");
   // you may not use this file except in compliance with the License.
   // You may obtain a copy of the License at

       // http://www.apache.org/licenses/LICENSE-2.0

   // Unless required by applicable law or agreed to in writing, software
   // distributed under the License is distributed on an "AS IS" BASIS,
   // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   // See the License for the specific language governing permissions and
   // limitations under the License.

onmessage = function(msg) {
   
   print("got msg. Starting work");
   
  //resize the image
  if (msg.img.width > msg.img.height){
	msg.img.resize(msg.size, 0);
  }
  else
  {
	msg.img.resize(0, msg.size);
  }
	
	//compute the contour
  contour = findContour(msg.img, msg.threshold)
  contourPixels = getContourList(contour, msg.threshold);
  contourPixels.splice(0, 0, createVector(0, height / 2));
  contourPixels = decimate(contourPixels, msg.distThreshold, 5);
  contourPixels = centerContour(contourPixels);

  //compute the contour dft
  [fourierX, fourierY] = curveDFT(contourPixels);

  fourierX.sort((a, b) => b.amp - a.amp);
  fourierY.sort((a, b) => b.amp - a.amp);	
  
  let workerResult = {fourierX, fourierY};
  
  print("Sending Data Back");
  postMessage(workerResult);
}