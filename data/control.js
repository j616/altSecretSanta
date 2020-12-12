$(function() {
    const apiWS = "ws://" + window.location.host + "/ws/";
    const apiBase = "http://" + window.location.host + "/"
    const apiPresBase = apiBase + "pres/pics/";
    const socket = new WebSocket(apiWS);
    var players = {};
    var playersNoPres = {};
    var allPlayers = {};
    var presents = {};
    var nextPlayer = null;

    socket.addEventListener('message', function (event) {
        processData(JSON.parse(event.data));
    });

    $("#randPerson").on("click", function() {
        randPerson();
    });

    $("#assignB").on("click", function() {
        assignPres();
    });

    function processData(data) {
        players = data["playersPresents"];
        playersNoPres = data["playersNoPresents"];
        allPlayers = { ...players, ...playersNoPres };
        presents = data["presents"];
        nextPlayer = data["nextPlayer"];

        setPlayersDD();
        setPresentDD();

        if (nextPlayer != null) {
            selectPlayer(nextPlayer);
        }
    }

    function setPlayersDD() {
        $("#personDD").empty();

        $("#personDD").append([
            $("<div/>", {
                class: "dropdown-header"
                }).text("Players with presents")
            ])

        appendPlayers(players, "");

        $("#personDD").append([
            $("<div/>", {
                class: "dropdown-divider"
                }),
            $("<div/>", {
                class: "dropdown-header"
                }).text("Players without presents")
            ]);

        appendPlayers(playersNoPres, " (no pres)");
    }

    function appendPlayers(thisPlayers, suffix) {
        for (const player in thisPlayers) {
            const id = "pers" + player;
            $("#personDD").append([
                $("<button/>", {
                    class: "dropdown-item",
                    type: "button",
                    id: id
                    }).text(thisPlayers[player]["name"] + suffix)
                ]);
            $("#" + id).on("click", function() {
                selectPlayer(player);
            });
        }
    }

    function setPresentDD() {
        $("#presDD").empty()

        for (const pres in presents) {
            const owner = presents[pres]["owner"];
            const id = "pres" + pres;

            var presName = pres;

            if (owner != null) {
                ownerName = players[owner]["name"];
                presName = presName + " - " + presents[pres]["short"];
                presName = presName + " (" + ownerName + ")";
            }
            $("#presDD").append([
                $("<button/>", {
                    class: "dropdown-item",
                    type: "button",
                    id: id
                    }).text(presName)
                ]);

            $("#" + id).on("click", function() {
                selectPres(pres);
            });
        }
    }

    function selectPlayer(player) {
        let playerName;

        if (player in playersNoPres) {
            setPersonDDB(player, " (no pres)");
        } else {
            setPersonDDB(player, "");
        }
    }

    function setPersonDDB(player, suffix) {
        var playerName = allPlayers[player]["name"] + suffix;

        $("#personDDB").text(playerName);
        $("#personDDB").val(player);
    }

    function selectPres(pres) {
        const pictureBase = apiPresBase + pres + "/";
        const owner = presents[pres]["owner"];

        setPresDDBName(pres, owner);

        $("#presInfo").empty();
        $("#presInfo").append([
            $("<h4/>", {class: "card-title"}).text(
                pres + " - " + presents[pres]["short"]
                ),
            $("<p/>", {class: "card-text"}).text(
                presents[pres]["long"]
                ),
            $("<img/>", {
                src: pictureBase + presents[pres]["wrapped"],
                height: "400"
                }),
            $("<img/>", {
                src: pictureBase + presents[pres]["unwrapped"],
                height: "400"
                })
            ])
    }

    function setPresDDBName(pres, owner) {
        var presName = pres

        if (owner != null) {
            ownerName = allPlayers[owner]["name"];
            presName = presName + " - " + presents[pres]["short"];
            presName = presName + " (" + ownerName + ")";
        }

        $("#presDDB").text(presName);
        $("#presDDB").val(pres);
    }

    function randPerson(){
        fetch(apiBase + "nextPlayer/");
    }

    function assignPres(){
        var person = $("#personDDB").val();
        var pres = $("#presDDB").val();

        if ((person == "null") | (pres == "null")){
            return;
        }

        fetch(apiBase + "pres/" + pres + "/", {
            method: "put",
            body: person});

        setPresDDBName(pres, parseInt(person));
        setPersonDDB(person, "");
    }
});
