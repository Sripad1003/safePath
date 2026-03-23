# Safe Path Recommender - Hyderabad & GHMC
Because you must look before you leave!


We are going to address the issue of safety in our project named ‘Safe Path Recommender’.

Hyderabad, a major IT and industrial hub in South India, encompasses the GHMC area and the surrounding Ranga Reddy district. As urban sprawl continues, the density and distribution of micro-level crimes like theft, harassment, and robberies change across the city.
People walk on the streets but they are not safe, back from work, parties, late night dinners, parks, and even shopping centers. Our web app helps users judge the safety of a specific neighborhood or route in real-time. We have mapped 500+ micro-level data points across Hyderabad including Hitech City, Madhapur, Mehdipatnam, Uppal, LB Nagar, and the Outer Ring Road (ORR) corridor!

## Our solution to the problem:
Google Maps provides the fastest route without considering security. Our web app calculates the safest route by evaluating the danger index along possible paths. Our custom data covers the entire GHMC and Ranga Reddy district precisely.


## Technical concept used:
We have applied the K-means clustering algorithm to find the danger index of many possible paths. We mapped 532 micro-level locations across Hyderabad assigning a magnitude of criminal activity in the range of 0 to 4. We use Google Maps and Google Places APIs to display all possible routes and calculate safety.
* **Danger Index**: Calculates safety for multiple paths and recommends the best one.
* **Autocomplete**: Integrated Google Places for easy location entry.
* **Travel Modes**: Support for Walking, Transit, and Driving.
* **Visual Markers**: Map hotspots indicate risk level (Green Tick to Red Skull).
* **Distributed Backend**: Uses Express, MongoDB, and Socket.IO for real-time GPS tracking and danger alerts.
* **Automation**: Python scripts for micro-level data generation and K-Means processing.
  *	Google Maps JavaScript API
  *	Google Maps Embed API
  *	Google Maps Directions API
  *	Google Maps Geolocation API
  *	Google Places API Web Service: 

## Result of training the model:

- The k-means algorithm assigns 0-4 magnitude of crime level to all locations in Delhi Ncr (Delhi, Noida and Gurgaon).
- The Danger Index of ‘0’ implies that the place considered is relatively much safe with less crime records in past while an index of 4 means that the place has high crime records in the past.
- The figure below is showing detailed information of the Safety of paths  below the map so that user also knows what all things he has to consider while making his choice to make smart decisions like Distance, Time Duration, Danger Index, Route Number, and Color of the Route.

## Legend
- Green Ticks: Safest
- Smiley: Moderately safe
- Exclamation mark: Be careful
- Skull: Moderately dangerous
- Cross: Extremely dangerous

### Homepage of the app looks like:
![Screenshot 1](https://github.com/ishank62/Safe-Path-Recommender/blob/master/images/Screenshot%20(147).png)


### This is how the Web App looks like while recommending Safe Paths:
![Screenshot 2](https://github.com/ishank62/Safe-Path-Recommender/blob/master/images/Screenshot%20(149).png)


### Web App Showing Safe Path between “Saket, New Delhi, India” to “Karkardooma, New Delhi, India” with the different markers (Skull, Exclamation Mark Triangle, Smiley, Green Ticks, etc) and different routed each colored differently.:
![Screenshot 3](https://github.com/ishank62/Safe-Path-Recommender/blob/master/images/Screenshot%20(148).png)


### Figure showing the statistics of the recommended 3 Safe Paths like its Color, Time Duration for the respective path, Distance of the path, Danger Index (according to which the priority of listing of paths is set):
![Screenshot 4](https://github.com/ishank62/Safe-Path-Recommender/blob/master/images/Screenshot%20(150).png)



This Project was made by [Ishank Agarwal](https://www.github.com/ishank62) as a part of College Minor Project.