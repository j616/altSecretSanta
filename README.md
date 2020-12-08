# Alternative Secret Santa - Web Panel

At my workplace, we have a yearly tradition of two Secret Santas. A traditional one, and an alternative one. In the alternative one all presents go in a pile, names are pulled from a hat, and that person gets to either open a present or steal one that's already been opened. When your present is stolen, you can either open another or steal another with no immediate steal-backs. Events in 2020 have made it impossible to play this game in person. This repo implements a web-based control panel to facilitate playing over zoom etc.

Each player has a folder within `./data/` with a positive integer name containing a photo of their present when wrapped, a photo of their present when opened, and a config file with their name, a short description of their present, and a longer description to be read out by the host on opening. An example folder exists in `./data/example/` Two web pages are provided. One intended to be shown over zoom shows pictures of the presents initially wrapped, and then un-wrapped with their short description and the name of the current owner as they are opened. The second interface is for use behind the scenes by the host. It provides a means to randomly pick a name, for assigning presents, for showing who's turn to open/steal it currently is, and for prompting with the long present description.

## Run locally

In the project root, run:-
```bash
docker-compose -f docker/docker-compose.yml up
```

If you re-pull or update the code, you'll want to run this first:-
```bash
docker-compose -f docker/docker-compose.yml build
```