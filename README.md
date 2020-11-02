# imageScriber

This project generates some animated looping animation which draws
the contour of any image  (albeit with clear contours) with a fourrier transform epicycle.

Essentially, when a user inputs an image, a very basic Canny extracts the contours and a 
script connect the closest points of the contour. The resulting contour then undergoes a fourrier
transform which is then used by the epicycle.
The animation simply redraws and undraws the contour.

This project was inspired by the amazing work of Dan over at The Coding Train youtube channel

## How to use

Clone the repo, and then run the index.html in your internet browser of choice.

## Copyright

Copyright 2019 Niels Pichon

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

