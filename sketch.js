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

let img;
let canvas;
//const pathToImg = 'niels.jpg';
let contour;
let contourPixels;
let idx = 0;
let size = 300;
let threshold = 0.08;
let fourierY;
let fourierX;
let time = 0;
let path = [];
let maxFreq = 100000000000;
let distThreshold = 5;
let drawImg = false;
let showImage = false;
let loading = false;
let equalizeHist = false;
// let sobelworker;


function preload() {
  //img = loadImage(pathToImg);
}

function epiCycles(x, y, rotation, fourier, maxFreq) {
  for (let i = 0; i < min(maxFreq, fourier.length); i++) {
    let prevx = x;
    let prevy = y;
    let freq = fourier[i].freq;
    let radius = fourier[i].amp;
    let phase = fourier[i].phase;
    x += radius * cos(freq * time + phase + rotation);
    y += radius * sin(freq * time + phase + rotation);

    stroke(255, 100);
    noFill();
    strokeWeight(1)
    ellipse(prevx, prevy, radius * 2);
    stroke(255);
    strokeWeight(1)
    line(prevx, prevy, x, y);
  }
  return createVector(x, y);
}


function setup() {
  //create the canvas 
	canvas = createCanvas(windowWidth, windowHeight);
	size = min(windowWidth, windowHeight) - 400;
	
	background(0);
	textSize(32);
	fill(255);
	textAlign(CENTER, CENTER);
	text('Drag Image', windowWidth / 2, windowHeight / 2);
  
	canvas.dragOver(highlight);
	canvas.dragLeave(unhighlight);
	canvas.drop(gotImage, unhighlight);
	
	
	// if (window.Worker) {
		// sobelworker = new Worker('worker.js');
		
		// sobelworker.onmessage = function(msg){
			// print("got data back");
			// fourierX = msg.fourierX;
			// fourierY = msg.fourierY;
			// time = 0;
			// path = [];
			// loading = false;
			// drawImg = true;
			// canvas.drop(gotImage, unhighlight);	
	// }
	// };
}

function mousePressed(){
	showImage = true;	
}

function mouseReleased(){
	showImage = false;
}

function highlight(){	
	background(50);
	textSize(32);
	fill(15);
	textAlign(CENTER, CENTER);
	text('Drag Image', windowWidth / 2, windowHeight / 2);
}

function unhighlight(){	
	background(0);
	textSize(32);
	fill(255);
	textAlign(CENTER, CENTER);
	text('Drag Image', windowWidth / 2, windowHeight / 2);
}

function gotImage(file){
	if (file.type === 'image') {
		drawImg = false;	
		loading = true;
		
		canvas.dragOver(false);
		canvas.dragLeave(false);
		canvas.drop(false, false);
		
		
		background(0)
		textSize(32);
		fill(255);
		strokeWeight(1);
		textAlign(CENTER, CENTER);
		text('Loading', windowWidth / 2, windowHeight / 2);
		
		img = loadImage(file.data, processImage);	
	}
}

function processImage(){
	
	
	// if (window.Worker) {
		// let imgData = { img, size, threshold, distThreshold};	
		// sobelworker.postMessage(imgData);
	// }
	// else{
		// //resize the image
		// if (img.width > img.height){
			// img.resize(size, 0);
		// }
		// else
		// {
			// img.resize(0, size);
		// }
		


		
			//compute the contour
		contour = findContour(img, threshold, equalizeHist)
		
				//resize the image
		if (img.width > img.height){
			img.resize(size, 0);
			contour.resize(size,0);
		}
		else
		{
			img.resize(0, size);
			contour.resize(size,0);
		}
		
		
		contourPixels = getContourList(contour, threshold);
		contourPixels.splice(0, 0, createVector(0, height / 2));
		contourPixels = decimate(contourPixels, distThreshold, 5);
		// contourPixels = decimate2(contourPixels, 1);
		contourPixels = centerContour(contourPixels);
	
		//compute the contour dft
		[fourierX, fourierY] = curveDFT(contourPixels);
	
		fourierX.sort((a, b) => b.amp - a.amp);
		fourierY.sort((a, b) => b.amp - a.amp);	
		
		time = 0;
		path = [];
		loading = false;
		drawImg = true;
		canvas.drop(gotImage, unhighlight);
	// }
	
	
}


function draw() {
	
	if(drawImg){
		if (showImage){
		
		background(0);
		image(contour,0,0);
	}
	else{
		if (time < TWO_PI) {
			const dt = TWO_PI / fourierY.length;
			if (showImage){
				background(0);
				// image(img, windowWidth / 2 - img.width / 2, windowHeight/2 - img.height / 2);		
			}
			else
			{
				background(0);
			}
				
			let vx = epiCycles(width / 2, 100, 0, fourierX, maxFreq);
			let vy = epiCycles(100, height / 2 + 100 , HALF_PI, fourierY, maxFreq);
			let v = createVector(vx.x, vy.y);
			path.unshift(v);
			if (time < TWO_PI - dt) {
			line(vx.x, vx.y, v.x, v.y);
			line(vy.x, vy.y, v.x, v.y);
			}
		
			beginShape();
			noFill();
			strokeWeight(3)
			stroke(255)
			for (let i = 0; i < path.length; i++) {
			curveVertex(path[i].x, path[i].y);
			}
			endShape();
			time += dt;
		}
		else if (time < 2 * TWO_PI){
			const dt = TWO_PI / fourierY.length;
			if (showImage){
				background(0);
				// image(img, windowWidth / 2 - img.width / 2, windowHeight/2 - img.height / 2);		
			}
			else
			{
				background(0);
			}
				
			let vx = epiCycles(width / 2, 100, 0, fourierX, maxFreq);
			let vy = epiCycles(100, height / 2 + 100, HALF_PI, fourierY, maxFreq);
			let v = createVector(vx.x, vy.y);
			path.pop();
			if (time < 4 * TWO_PI - dt) {
				line(vx.x, vx.y, v.x, v.y);
				line(vy.x, vy.y, v.x, v.y);
			}
		
			beginShape();
			noFill();
			strokeWeight(3)
			stroke(255)
			for (let i = 0; i < path.length; i++) {
			curveVertex(path[i].x, path[i].y);
			}
			endShape();
			time += dt;
		}
		else{
			time = 0;
		}
	}
	}
	else if (loading){
		const dt = TWO_PI / 100;
		
		background(0)
		textSize(32);
		fill(255);
		textAlign(CENTER, CENTER);
		strokeWeight(1);
		text('Loading', windowWidth / 2, windowHeight / 2);
		
		noFill();
		strokeWeight(3);
		stroke(255);
		ellipse(windowWidth * 0.6, windowHeight * 0.5, 60); 
		strokeWeight(1);
		line(windowWidth * 0.6, windowHeight * 0.5, windowWidth * 0.6 + 30 * cos(time), windowHeight * 0.5 + 30 * sin(time));
		
		time += dt;
	}

}