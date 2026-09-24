// ==UserScript==
// @name         SAAF Text Highlighter
// @version      3
// @description  Show ACIDs, aircraft names with categories (only for classified aircraft), server time in chat + Enhanced multiplayer labels
// @match        https://www.geo-fs.com/geofs.php?v=*
// @grant        none
// @author       original d-1, SAAF version amateurtheairbus
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// ==/UserScript==

(function () {
  function init() {
    const style = document.createElement("style");
    style.textContent = `
            .my-friend {
                color: #ff00bbff;
                font-weight: bolder !important;
            }
            .my-red {
                color: #ffcc22ff;
                font-weight: bolder !important;
            }
            .my-bar {
                position: relative;
                color: #fff;
                margin: 1px;
                text-shadow: 0px 0px 3px #000;
            }
            .geofs-servertime {
                color: #ffb006ff;
                font-size: 85%;
                margin-right: 6px;
                font-family: "Helvetica", sans-serif;
            }
            .geofs-chat-message {
                color: #ffffff;
            }
        `;
    document.head.appendChild(style);

    const hiddenStyle = document.createElement("style");
    hiddenStyle.textContent = `
            .geofs-servertime {
                display: none;
            }
            .my-friend {
                color: white !important;
                font-weight: bolder !important;
            }
            .my-red {
                color: white !important;
                font-weight: bolder !important;
            }
            .my-bar {
                display: none !important;
            }
        `;

    var isAdded = false;

    function getServerTimeStr() {
      try {
        if (multiplayer && "function" == typeof multiplayer.getServerTime) {
          return new Date(multiplayer.getServerTime())
            .toUTCString()
            .split(" ")[4];
        }
      } catch (e) {}
      return "N/A";
    }

    function checkIfSAAF(callsign) {
      callsign = callsign.toLowerCase();
      return callsign.includes("[saaf]") || callsign.includes("[saaf-t]");
    }

    function checkIfMRP(callsign) {
      callsign = callsign.toLowerCase();

      if (!checkIfSAAF(callsign)) {
        if (callsign.includes("[utp]") || callsign.includes("[u]")) return true;
        if (callsign.includes("[pmc]") || callsign.includes("[p]")) return true;
        if (/\[.*\]\[/i.test(callsign)) return true;
      }
    }

    ui.chat.publish = function (e) {
      if (!geofs.preferences.chat) return;

      const msg = decodeURIComponent(e.msg);
      ui.chat.$container = ui.chat.$container || $(".geofs-chat-messages");

      let labelClass = "";
      let formattedCallsign = "";
      const serverTime = getServerTimeStr();

      if (e.acid == geofs.userRecord.id) {
        labelClass = "myself";
        formattedCallsign = e.cs;
      } else {
        formattedCallsign = `${e.acid} | ${e.cs}`;
      }

      ui.chat.$container.prepend(`
                <div class="geofs-chat-message ${e.rs}">
                    <span class="geofs-servertime">${serverTime}</span>
                    <b class="label ${labelClass} ${checkIfMRP(e.cs) && labelClass != "myself" ? "my-red" : checkIfSAAF(e.cs) ? "my-friend" : ""}"
                       data-player="${e.uid}" acid="${e.acid}" callsign="${e.cs}">
                        ${formattedCallsign}:
                    </b> ${msg}
                </div>
            `);

      ui.chat.$container
        .find(".geofs-chat-message")
        .each(function (i, el) {
          $(el).css(
            "opacity",
            (ui.chat.maxNumberMessages - i) / ui.chat.maxNumberMessages,
          );
        })
        .eq(ui.chat.maxNumberMessages)
        .remove();
    };

    function toggle() {
      isAdded = isAdded
        ? (hiddenStyle.remove(), false)
        : (document.head.appendChild(hiddenStyle), true);
    }

    document.addEventListener("keydown", (e) => {
      e.key.toLowerCase() === "u" && toggle();
    });
  }

  window.executeOnEventDone("geofsInitialized", init);
})();
