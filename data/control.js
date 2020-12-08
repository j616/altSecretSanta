$(function() {
    const apiWS = "ws://" + window.location.host + "/ws/";
    const apiBase = "http://" + window.location.host + "/"
    const apiPresBase = apiBase + "pres/pics/";
    const socket = new WebSocket(apiWS);
    var players = {};
    var playersNoPres = {};
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
        presents = data["presents"];
        nextPlayer = data["nextPlayer"];

        $("#personDD").empty();

        $("#personDD").append([
            $("<div/>", {
                class: "dropdown-header"
                }).text("Players with presents")
            ])

        for (const player in players) {
            const id = "pers" + player;
            $("#personDD").append([
                $("<button/>", {
                    class: "dropdown-item",
                    type: "button",
                    id: id
                    }).text(players[player]["name"])
                ]);
            $("#" + id).on("click", function() {
                selectPlayer(player);
            });
        }

        $("#personDD").append([
            $("<div/>", {
                class: "dropdown-divider"
                }),
            $("<div/>", {
                class: "dropdown-header"
                }).text("Players without presents")
            ]);

        for (const player in playersNoPres) {
            const id = "pers" + player;
            $("#personDD").append([
                $("<button/>", {
                    class: "dropdown-item",
                    type: "button",
                    id: id
                    }).text(playersNoPres[player]["name"] + " (no pres)")
                ]);
            $("#" + id).on("click", function() {
                selectPlayer(player);
            });
        }

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

        if (nextPlayer != null) {
            selectPlayer(nextPlayer);
        }
    }

    function selectPlayer(player) {
        console.log(player);

        let playerName;

        if (player in playersNoPres) {
            playerName = playersNoPres[player]["name"] + " (no pres)";
        } else {
            playerName = players[player]["name"];
        }

        $("#personDDB").text(playerName);
        $("#personDDB").val(player);
    }

    function selectPres(pres) {
        console.log(pres);
        const pictureBase = apiPresBase + pres + "/";

        const owner = presents[pres]["owner"];
        var presName = pres

        if (owner != null) {
            ownerName = players[owner]["name"];
            presName = presName + " - " + presents[pres]["short"];
            presName = presName + " (" + ownerName + ")";
        }

        $("#presDDB").text(presName);
        $("#presDDB").val(pres);
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
    }
});
