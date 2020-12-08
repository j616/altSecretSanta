$(function() {
    const apiWS = "ws://" + window.location.host + "/ws/";
    const apiPresBase = "http://" + window.location.host + "/pres/pics/";
    const socket = new WebSocket(apiWS);
    const table = $("#presBody");

    socket.addEventListener('message', function (event) {
        processData(JSON.parse(event.data));
    });

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function processData(data) {
        var players = data["playersPresents"];
        var presents = data["presents"];
        var prevPres = data["prevPresent"];
        var thisTR = [];

        table.empty();

        for (const pres in presents) {
            const owner = presents[pres]["owner"];
            var picture = apiPresBase + pres + "/";
            var ownerName = ""
            let desc;

            if (owner != null) {
                picture += presents[pres]["unwrapped"]
                desc = pres + " - " + presents[pres]["short"]
                ownerName = players[owner]["name"];
            } else {
                picture += presents[pres]["wrapped"]
                desc = pres
            }

            thisTR.push(formatTR(desc, picture, ownerName));

            if (thisTR.length == 5) {
                appendTR(thisTR)
                thisTR = [];
            }
        }

        if (thisTR.length != 0) {
            appendTR(thisTR)
        }

        if ((prevPres != null)
            & (prevPres !== getCookie("prevPres"))) {
            setCookie("prevPres", prevPres, 1);
            var picture = apiPresBase + prevPres + "/";
            picture += presents[prevPres]["unwrapped"];
            displayPrevPres(picture);
        }
    }

    function formatTR(desc, pic, owner) {
        return $("<td/>").append([
            $("<div/>").text(desc),
            $("<img>", {
                src: pic,
                width: "100%"
                }),
            $("<div/>").text(owner)
            ]);
    }

    function appendTR(tr) {
        table.append([
                $("<tr/>").append(tr)
                ]);
    }

    function displayPrevPres(pic) {
        $("#presModalBody").empty();
        $("#presModalBody").append([
            $("<img>", {
                src: pic,
                width: "100%"
                }),
            $("<button/>", {
                type: "button",
                class: "close",
                "data-dismiss": "alert",
                "aria-label": "Close"
            })
        ]);
        $('#presModal').modal('show');
    }

});
