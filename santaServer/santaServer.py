#!/usr/bin/python3
import asyncio
import json
from os import path, listdir
from random import choice as randChoice
import logging
import pickle

import tornado.websocket
from tornado.web import RequestHandler
from tornado.ioloop import IOLoop
from tornado.escape import json_decode

PORT = 80

logFormat = '%(asctime)s %(levelname)s %(pathname)s %(lineno)s %(message)s'
logLevel = logging.ERROR

logging.basicConfig(format=logFormat,
                    level=logLevel)
dataDir = "/etc/data"
stateFile = f"{dataDir}/state.txt"
infoName = "info.json"
picExts = [".jpg", ".jpeg", ".png"]
wrappedNames = [f"wrapped{e}" for e in picExts]
unwrappedNames = [f"unwrapped{e}" for e in picExts]


def intersection(lst1, lst2):
    return list(set(lst1) & set(lst2))


class Game():
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
        self.sockets = []
        self.nextPlayer = None
        self.prevPlayer = None

        if path.isfile(stateFile):
            self.loadState()

        dirCont = listdir(dataDir)

        for name in dirCont:
            fullPath = path.join(dataDir, name)
            if path.isdir(fullPath):
                # if not in loaded state
                if name not in self.presents:
                    self.presents[name] = {
                        "path": fullPath
                    }

        for p in self.presents:
            if p in self.players:
                # Was in loaded state
                continue

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
        if present not in self.presents:
            logging.error(f"{present} not in {self.presents}")
            return
        if owner not in self.players:
            logging.error(f"{owner} not in {self.players}")
            return

        oldOwner = self.presents[present]["owner"]
        self.presents[present]["owner"] = owner
        self.nextPlayer = oldOwner
        self.prevPlayer = owner

        self.saveState()

        ret = {"oldOwner": None}

        if oldOwner is not None:
            ret["oldOwner"] = self.players[oldOwner]

        return ret

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
            return player
        return None

    def getNextPlayer(self):
        if self.nextPlayer is not None:
            return self.nextPlayer
        self.nextPlayer = self.randomPlayerWithoutPres()
        self.saveState()

        return self.nextPlayer

    def getPresFromPlayer(self, player):
        if player is None:
            return None
        for p in self.presents:
            if self.presents[p]["owner"] == player:
                return p
        return None

    def saveState(self):
        state = {
            "players": self.players,
            "presents": self.presents,
            "nextPlayer": self.nextPlayer,
            "prevPlayer": self.prevPlayer
        }
        with open(stateFile, "wb") as f:
            pickle.dump(state, f)

    def loadState(self):
        with open(stateFile, "rb") as f:
            d = pickle.load(f)
            self.players = d["players"]
            self.presents = d["presents"]
            self.nextPlayer = d["nextPlayer"]
            self.prevPlayer = d["prevPlayer"]

    def formatState(self):
        return {
            "playersPresents": self.playersWithPresents,
            "playersNoPresents": self.playersWithoutPresents,
            "presents": self.presents,
            "nextPlayer": self.nextPlayer,
            "prevPlayer": self.prevPlayer,
            "prevPresent": self.getPresFromPlayer(self.prevPlayer)
        }

    def wsSendState(self):
        state = self.formatState()
        for s in self.sockets:
            s.write_message(state)


class WSHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, game):
        self.game = game

    def open(self):
        self.game.sockets.append(self)
        self.write_message(self.game.formatState())
        logging.info('ws new connection')

    def on_close(self):
        self.game.sockets.remove(self)
        logging.info('ws connection closed')


class BaseHandler(RequestHandler):
    def initialize(self, game):
        self.game = game


class NextPlayerHandler(BaseHandler):
    def get(self):
        self.write(self.game.getNextPlayer())
        self.game.wsSendState()


class SetPresentHandler(BaseHandler):
    def put(self, present):
        oldOwner = self.game.assignOwner(
            present, str(json_decode(self.request.body)))
        self.write(str(oldOwner))
        self.game.wsSendState()


class Application():
    def run(self):
        self.game = Game()

        handlerArgs = {"game": self.game}

        settings = {
            "static_path": dataDir,
        }

        server = tornado.web.Application([
            (r'/ws/?', WSHandler, handlerArgs),
            (r'/nextPlayer/?', NextPlayerHandler, handlerArgs),
            (r'/pres/([^/]*)/?', SetPresentHandler, handlerArgs),
            (r"/pres/pics/([^/]*/[^/]*\.jpg)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/pres/pics/([^/]*/[^/]*\.jpeg)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/pres/pics/([^/]*/[^/]*\.png)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/(index\.html)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/(control\.html)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/(index\.css)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/(index\.js)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
            (r"/(control\.js)", tornado.web.StaticFileHandler,
             dict(path=settings['static_path'])),
        ], **settings)

        server.listen(PORT)

        IOLoop.current().start()
