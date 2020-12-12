# Alternative Secret Santa - Web Panel

At my workplace, we have a yearly tradition of two Secret Santas. A traditional one, and an alternative one. In the alternative one all presents go in a pile, names are pulled from a hat, and that person gets to either open a present or steal one that's already been opened. When your present is stolen, you can either open another or steal another with no immediate steal-backs. Events in 2020 have made it impossible to play this game in person. This repo implements a web-based control panel to facilitate playing over zoom etc.

## Preparation

Each player has a folder within `./data/` with a positive integer name (e.g. `./data/1/`) containing:- 
* a photo of their present when wrapped (named `wrapped.jpg`, `wrapped.jpeg`, or `wrapped.png`)
* a photo of their present when opened (named `unwrapped.jpg`, `unwrapped.jpeg`, or `unwrapped.png`)
* a config file (named `info.json`. See example.) with their name, a short description of their present, and a longer description to be read out by the host on opening

An example folder exists in `./data/example/`. This folder is ignored by the software.

## Game-play

Two web pages are provided. One at `http://localhost:8080/index.html` intended to be shown over zoom shows pictures of the presents initially wrapped, and then un-wrapped with their short description and the name of the current owner as they are opened. The second interface is at `http://localhost:8080/control.html` and is for use behind the scenes by the host. It provides a means to randomly pick a name, for assigning presents, for showing who's turn to open/steal it currently is, and for prompting with the long present description. The intended flow of the game is as follows:-
* Host clicks `Random Person Without Pres` to randomly select a player
* Host announces their name
* Player says which present they wish to open/steal
* Host selects this from the list
* If the present is being stolen
    - Host clicks assign
    - The interface will select automatically select the person the present is being stolen from.
* If the present is being opened
    - Host reads out the long present description
    - Host clicks assign
* The assigned present will be displayed in a window on the main game screen
    - Host should close this window
* Repeat until all presents have been opened
* Distribute presents to their recipient as you see fit

## Requirements
You need `docker-compose` installed to run this software.

## Run locally

In the project root, run:-
```bash
docker-compose -f docker/docker-compose.yml up
```

The game will be served as a web page at `http://localhost:8080/index.html` by default. To change the port used, edit the mapping in `docker/docker-compose.yml`.

If you re-pull or update the code, you'll want to run this first:-
```bash
docker-compose -f docker/docker-compose.yml build
```

## Reset game

To reset the game, remove the `./data/state.txt` file.