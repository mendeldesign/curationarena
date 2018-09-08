# README Curation Arena

**Curation Arena** offers a web-based platform for large display curation and display of personal photos. It uses two handheld devices to control one larger display.

![Artist impression of CurationArena in action][image-1]
_Artist impression of Curation Arena_

This was part of a [Materialising Memories][1] project into the curation of personal photos and interpersonal storytelling. It was developed to be run in the [UTS Data Arena][2], a large-scale (10m) 360º display.

Design: [Mendel Broekhuijsen][3]

Coding: [Mendel Broekhuijsen][4] & [Jesus Muñoz Alcantara][5], Eindhoven University of Technology

## Setup
The system uses a `nodejs` server (the focus of this repository), with each device running a browser window for their respective interfaces. A maximum of two handheld devices are each served a dedicated set of photos to browse (which have to be uploaded to the server beforehand), while the display device would start with a black screen. Users can select photos to put onto the display screen, filling it up over time.

We have tested the system with various devices and browsers. Google Chrome/Chromium and iPads seem to be supported the best, but MacBooks with Firefox and a Hololens running Microsoft’s Edge browser also work fine. A large TV should also suffice if you don’t have a Data Arena handy.

## Installation of server
- Clone or download this repository
- Install [exiftool][6]
- Install [nodejs][7] (we tested with v8)
- (for macOS) Install Xcode Command Line Tools via `xcode-select --install`

Open a terminal window and navigate to the `curationarena` directory. Run the following command to update and compile all dependencies:

`npm update`

This should complete without major errors, otherwise those would need to be resolved first.

## Running the software
`npm start` will start a webserver on port 3000.

To see the arena view, open a browser window and go to [http://localhost:3000/arena-view.html][8] (assuming you’re viewing this on the same device as the server is running on, otherwise substitute localhost for the correct IP-address). This view is black when just launched or (in later versions) features a mostly black background with a dotted pattern.

In the Data Arena, a full-width Chromium window is required and should point to the same URL as listed above. When running the server off a laptop, it may be wise to get a fixed IP-address to avoid it changing upon restarts, standby, etc.

iPads (or other devices with a comparable display resolution) should navigate to [http://localhost:3000][9]. The user will be prompted to choose between participating as `A` or `B`. The interface works best when run fullscreen, if possible. Loading the page may take a little while as images are downloaded all at once.

Once ready, tapping a photo on the tablet screen makes it appear on the arena screen. That photo gets a blue border on the tablet to indicate its published status. Tapping it once more removes it from the arena view. That’s it!

To stop the webserver, use `^c (ctrl+c)`, or close the terminal window.

## Adding photos
At the moment, two users can show, browse, and tell at the same time. Their photos are located in two folders in `curationarena/public/ExamplePhotos`. Photos go in respectively the `A` and `B` folders for each user.

Adding photos only works before the server is started. Once it starts, the server will first make thumbnails of all images it can find. This process may take a while but is much quicker upon subsequent starts as it skips over images for which thumbnails were created previously.

Based on our experience, adding more than a few hundred photos for a single session tends to be counterproductive; most will be skipped over during the actual use of Curation Arena.

[1]:	http://www.materialisingmemories.com/
[2]:	https://www.uts.edu.au/partners-and-community/data-arena/overview
[3]:	http://www.mendeldesign.nl/
[4]:	http://www.mendeldesign.nl/
[5]:	http://agoagouanco.com/
[6]:	https://sno.phy.queensu.ca/~phil/exiftool/index.html
[7]:	https://nodejs.org/en/
[8]:	http://localhost:3000/arena-view.html
[9]:	http://localhost:3000

[image-1]:	Curation-Arena-Impression.png