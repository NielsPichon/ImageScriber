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

function dft(x) {
  const X = [];
  const N = x.length;
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const phi = (TWO_PI * k * n) / N;
      re += x[n] * cos(phi);
      im -= x[n] * sin(phi);
    }
    re = re / N;
    im = im / N;

    let freq = k;
    let amp = sqrt(re * re + im * im);
    let phase = atan2(im, re);
    X[k] = {
      re,
      im,
      freq,
      amp,
      phase
    };
  }
  return X;
}


function curveDFT(pixels) {
  let x = [];
  let y = [];
  for (let i = 0; i < pixels.length; i++) {
    x.push(pixels[i].x);
    y.push(pixels[i].y);
  }

  let dftX = dft(x);
  let dftY = dft(y);
  return [dftX, dftY];
}

function lowPass(pix, maxFreq) {
  let sorted = [];
  arrayCopy(pix, 0, sorted, 0, min(maxFreq, pix.length));
  return sorted;
}