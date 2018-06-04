# README CurationArena

**CurationArena** offers a nodejs-based platform for large display curation and display of personal photos.

This was part of a [Materialising Memories][1] project into the curation of personal photos and interpersonal storytelling. It was developed to be run in the [UTS Data Arena][2], a large-scale 360º display.

Design: Mendel Broekhuijsen
Coding: Mendel Broekhuijsen & Jesus Muñoz Alcantara, Eindhoven University of Technology

## Installation
- Clone or download this repository
- Install [exiftool][3]
- Install [nodejs][4]
- (for macOS) Install Xcode Command Line Tools via `xcode-select --install`

Open a terminal window and navigate to the curationarena directory. Run the following command to update and compile all dependencies:

`npm update`

This should complete without major errors, otherwise those would need to be resolved first.

## Running the software
`npm start` will start a webserver on port 3000.

Om de server te testen kun je dan twee webbrowser tabbladen openen, 1 met [http://localhost:3000/arena-view.html][5], het scherm van de data arena - zou zwart moeten zijn. En 1 met http://localhost:3000/, waar je vervolgens kunt kiezen voor user A of B. Er staan een paar fotos in de map `curationarena/public/ExamplePhotos`, waar je per gebruiker de mapjes kunt vullen met gewone jpg fotos (max 500 raad ik aan). Hoe meer fotos, hoe langer de server bij de start nodig heeft om de thumbnails te maken. Na de eerste keer checked hij eerst of de thumbnails er al zijn, waardoor het dan sneller gaat.

Om het geheel in de data arena te laten draaien hebben we de hulp nodig van Darren Lee. De data arena moet een Chromium tapblad over de gehele breedte uitspreiden en die moet vervolgens naar: [http://\<ipadreslaptop\>:3000/arena-view.html][6] gaan. Ik had voor de test een bedraad, fixed ip adres van de data arena gekregen, omdat het anders de hele tijd als je uit standby komt je ip verandert, en dat wil je ook niet voor je ipads, want die verwijzen ook direct naar je laptop’s webserver. Dus check dat even, of houd je computer aan vlak voor de demo!

Als het goed is heb je nu een zwart scherm in de data arena.

iPad’s (of andere tablets met eenzelfde resolutie scherm) moeten naar [http://\<ipadreslaptop\>:3000][7] en dan kiezen voor A of B. Werkt het beste in Chrome browser, en dan full-screen. Het laden kan even duren, in de terminal van de mac zie je de log als het bezig is, en ook als een iPad connectie maakt met de server.

Als je een foto selecteert op de iPad verschijnt hij op het scherm van de arena, en krijgt de foto op de tablet een blauwe rand. bij het de-selecteren verdwijnt de foto van het arena scherm. That’s it!

To stop the webserver, use `^c (ctrl+c)`, or close the terminal window.

## Adding photos

At the moment, two users can show, browse, and tell at the same time. Their photos are located in two folder in `public/ExamplePhotos`. Photos go in respectively the `A` and `B` folders for each user.

[1]:	http://www.materialisingmemories.com/
[2]:	https://www.uts.edu.au/partners-and-community/data-arena/overview
[3]:	https://sno.phy.queensu.ca/~phil/exiftool/index.html
[4]:	https://nodejs.org/en/
[5]:	http://localhost:3000/arena-view.html
[6]:	http://localhost:3000/arena-view.html
[7]:	http://localhost:3000