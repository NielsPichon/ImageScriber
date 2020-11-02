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

function sobelFilter(img) {
  let filtered = createImage(img.width, img.height);
  filtered.loadPixels();
  img = histEqualizer(img);
  img.loadPixels();
  for (let x = 1; x < filtered.width - 1; x++) {
    for (let y = 1; y < filtered.height - 1; y++) {
      let gray = abs(-brightness(img.get(x - 1, y)) + brightness(img.get(x + 1, y))- brightness(img.get(x, y - 1)) + brightness(img.get(x, y + 1)));
    filtered.set(x, y, color(gray));
  }
}
filtered.updatePixels();
return filtered;
}

function sobelFilter3(img, equalizeHist) {
  let filtered = createImage(img.width, img.height);
  if (equalizeHist){
	img = histEqualizer(img);
  }
  filtered.loadPixels();
  img.loadPixels();
  for (let x = 1; x < filtered.width - 1; x++) {
    for (let y = 1; y < filtered.height - 1; y++) {
      let gray = sqrt(pow((-brightness(img.get(x - 1, y)) + brightness(img.get(x + 1, y))),2) + pow(- brightness(img.get(x, y - 1)) + brightness(img.get(x, y + 1)),2));
    filtered.set(x, y, color(gray));
  }
}
filtered.updatePixels();
return filtered;
}

function sobelFilter2(img) {
  let filtered = createImage(img.width, img.height);
  filtered.loadPixels();
  img.loadPixels();
  for (let x = 2; x < filtered.width - 2; x++) {
    for (let y = 2; y < filtered.height - 2; y++) {
      let gray = abs(brightness(img.get(x - 2, y)) + brightness(img.get(x + 2, y)) - 2 * brightness(img.get(x, y)) + brightness(img.get(x, y - 2)) + brightness(img.get(x, y + 2)) - 2 * brightness(img.get(x, y)));
      filtered.set(x, y, color(gray));
    }
  }
  filtered.updatePixels();
  return filtered;
}

function findContour(img, threshold, equalizeHist) {
  let filteredImg = sobelFilter3(img, equalizeHist);
  filteredImg.filter(THRESHOLD, threshold);
  let dilateSize = 3;
  for (let i = 0; i < dilateSize; i++) {
    filteredImg.filter(DILATE);
  }
  for (let i = 0; i < dilateSize; i++) {
    filteredImg.filter(ERODE);
  }
  return filteredImg;
}

function getContourList(contour, threshold) {
  //record all white pixels
  contour.loadPixels();
  let pix = [];
  for (let x = 1; x < contour.width - 1; x++) {
    for (let y = 1; y < contour.height - 1; y++) {
      if (red(contour.get(x, y)) > threshold * 255) {
        pix.push(createVector(x, y));
      }
    }
  }
  //sort by proximity to the image center line  
  pix.sort((a, b) => abs(a.y - contour.height / 2) - abs(b.y - contour.height / 2));


  let i = 0;
  while (i < pix.length - 1) {
    //sort by proximity to previous pixel
    let min = sqrt(pow(width, 2) + pow(height, 2));
    let pointIdx = i + 1;
    for (let j = i + 1; j < pix.length; j++) {
      let dist = sqrt(pow((pix[j].x - pix[i].x), 2) + pow((pix[j].y - pix[i].y), 2));
      if (dist < min) {
        min = dist;
        pointIdx = j;
      }
    }

    let closestPoint = pix[pointIdx].copy();
    pix[pointIdx].x = pix[i + 1].x;
    pix[pointIdx].y = pix[i + 1].y;
    pix[i + 1].x = closestPoint.x;
    pix[i + 1].y = closestPoint.y;

    i++;
  }

  return pix;
}

function decimate(pix, distThreshold, amount) {
  for (let i = 0; i < amount; i++) {
    let buffer = [];
    for (let j = 0; j < pix.length; j++) {
      buffer.push(pix[j]);
      if (j < pix.length - 1) {
        let dist = sqrt(pow((pix[j + 1].x - pix[j].x), 2) + pow((pix[j + 1].y - pix[j].y), 2));
        if (dist < distThreshold) {
          j++
        }
      }
    }
    pix = [];
    arrayCopy(buffer, 0, pix, 0, buffer.length);
  }
  return pix;
}


function decimate2(pix, distThreshold) {
  for (let i = 0; i < pix.length; i++) {
    let buffer = [];
    for (let j = i+1; j < pix.length; j++) {
      
      let dist = sqrt(pow((pix[j].x - pix[i].x), 2) + pow((pix[j].y - pix[i].y), 2));
      if (dist > distThreshold) {
          buffer.push(pix[j]);
      }
    }
    pix = [];
    arrayCopy(buffer, 0, pix, 0, buffer.length);
  }
  return pix;
}


function centerContour(pix) {
  let meanX = 0;
  let meanY = 0;
  for (let i = 0; i < pix.length; i++) {
    meanX += pix[i].x;
    meanY += pix[i].y;
  }

  meanX = meanX / pix.length;
  meanY = meanY / pix.length;

  for (let i = 0; i < pix.length; i++) {
    pix[i].x -= meanX;
    pix[i].y -= meanY;
  }

  return pix;
}


function histogram(img){
	img.loadPixels();
	
	let  hist = Array(256).fill(0);
	
	for (let x = 1; x < img.width - 1; x++) {
		for (let y = 1; y < img.height - 1; y++) {
			hist[floor(brightness(img.get(x,y)))] += 1;
		}
	}
	return hist;
}

function histEqualizer(img){
	//compute the histogram of the image
	let hist = histogram(img);
	
	//compute the cumulative sum of the histrogram
	let count = 0;
	let cdf =  Array(256).fill(0);
	for (let i = 1; i < 256; i++){
		count += hist[i];
		cdf[i] = count;
	}
	
	let map = [];
	for (let i = 0; i < 256; i++){
		map.push(floor(255 * cdf[i] / max(cdf)));
	}
	
	img.loadPixels();
	for (let x = 1; x < img.width - 1; x++) {
		for (let y = 1; y < img.height - 1; y++) {
			let clr = map[floor(brightness(img.get(x,y)))];
			img.set(x,y,color(clr));
		}
	}
	img.updatePixels();
	return img;
}