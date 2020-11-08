# Alternative Secret Santa - Web Panel

__WORK IN PROGRESS__

At my workplace, we have a yearly tradition of two Secret Santas. A traditional one, and an alternative one. In the alternative one all presents go in a pile, names are pulled from a hat, and that person gets to either open a present or steal one that's already been opened. When your present is stolen, you can either open another or steal another with no immediate steal-backs. Events in 2020 have made it impossible to play this game in person. This repo implements a web-based control panel to facilitate playing over zoom etc.

Each player has a folder containing a photo of their present when wrapped, a photo of their present when opened, and a config file with their name, a short description of their present, and a longer description to be read out by the host on opening. Two web pages are provided. One intended to be shown over zoom shows pictures of the presents initially wrapped, and then un-wrapped with their short description and the name of the current owner as they are opened. The second interface is for use behind the scenes by the host. It provides a means to randomly pick a name, for assigning presents, for showing who's turn to open/steal it currently is, and for prompting with the long present description.

## Installation

### Install using docker

A docker image for this package is available on [Docker Hub](https://hub.docker.com/r/j616s/metrolinktimes).

### Install from source

The following is used to install install in a venv for testing.

Install pyenv
```bash
curl https://pyenv.run | bash
```

Install Python 3.7
```bash
pyenv install 3.7.7
```
After installing, it may suggest to add initialization code to `~/.bashrc`. Do that.

Install Poetry
```bash
pip3 install --user poetry
```

Configure and install the environment used for this project.
__Run in the root of the cloned directory__
```bash
pyenv local 3.7.7
poetry install
```

During development, you need to have your environment activated. When it is activated, your terminal prompt is prefixed with (.venv).

Visual Studio code with suggested settings does this automatically whenever you open a .py file. If you prefer using a different editor, you can do it manually by running:
```bash
poetry shell
```