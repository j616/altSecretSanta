#!/usr/bin/python3
import asyncio
import json
from os import path, listdir
from random import choice as randChoice
import logging

logFormat = '%(asctime)s %(levelname)s %(pathname)s %(lineno)s %(message)s'
logLevel = logging.ERROR
logFile = '/var/log/sanataServer/sanataServer.log'

if path.isdir(path.dirname(logFile)):
    logging.basicConfig(filename=logFile,
                        format=logFormat,
                        level=logLevel)
else:
    logging.basicConfig(format=logFormat,
                        level=logLevel)
dataDir = "/etc/data"
infoName = "info.json"
picExts = [".jpg", ".jpeg", ".png"]
wrappedNames = [f"wrapped{e}" for e in picExts]
unwrappedNames = [f"unwrapped{e}" for e in picExts]


def intersection(lst1, lst2):
    return list(set(lst1) & set(lst2))


class Application():
    def __init__(self):
        def wrappedName(theseNames, p):
            names = intersection(theseNames, wrappedNames)
            if len(names) > 1:
                raise KeyError(f"Multiple wrapped pics found for {p}")
            if len(names) == 0:
                raise KeyError(f"No wrapped pics found for {p}")
            return names[0]

        def unwrappedName(theseNames, p):
            names = intersection(theseNames, unwrappedNames)
            if len(names) > 1:
                raise KeyError(f"Multiple unwrapped pics found for {p}")
            if len(names) == 0:
                raise KeyError(f"No unwrapped pics found for {p}")
            return names[0]

        self.presents = {}
        self.players = {}

        dirCont = listdir(dataDir)

        for name in dirCont:
            fullPath = path.join(dataDir, name)
            if path.isdir(fullPath):
                self.presents[name] = {
                    "path": fullPath
                }

        for p in self.presents:
            present = self.presents[p]
            pDir = listdir(present["path"])
            if infoName not in pDir:
                raise KeyError(f"info.json not found for {p}")

            infoPath = path.join(present["path"], infoName)
            with open(infoPath, 'r') as f:
                data = json.loads(f.read())

                self.players[p] = {"name": data["name"]}
                self.presents[p]["short"] = data["short"]
                self.presents[p]["long"] = data["long"]
                self.presents[p]["owner"] = None

            self.presents[p]["wrapped"] = wrappedName(pDir, p)
            self.presents[p]["unwrapped"] = unwrappedName(pDir, p)

    def assignOwner(self, present, owner):
        oldOwner = self.presents[present]["owner"]
        self.presents[present]["owner"] = owner

        return {oldOwner: self.players[oldOwner]}

    def playersFromNumbers(self, numList):
        return {p: self.players[p] for p in self.players
                if p in numList}

    @property
    def playersWithPresents(self):
        players = set([
            self.presents[p]["owner"] for p in self.presents
            if self.presents[p]["owner"] is not None])
        return self.playersFromNumbers(players)

    @property
    def playersWithoutPresents(self):
        players = self.players.keys() ^ self.playersWithPresents
        return self.playersFromNumbers(players)

    def randomPlayerWithoutPres(self):
        if len(self.playersWithoutPresents) > 0:
            player = randChoice(list(self.playersWithoutPresents))
            return {player: self.players[player]}
        return None

    def run(self):
        print(self.presents)
        print(self.players)
        print(self.playersWithPresents)
        print(self.playersWithoutPresents)
        print(self.randomPlayerWithoutPres())
