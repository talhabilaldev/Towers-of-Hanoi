var numberOfDisks = 3;
var movesDone = 0;
var interval = "";
$("#diskUp").click(function () {
    if ((numberOfDisks + 1) <= 9) {
        $("#diskNumberValue").val(++numberOfDisks);
        clearInterval(interval);
        createGame();
    }
});
$("#diskDown").click(function () {
    if ((numberOfDisks - 1) >= 3) {
        $("#diskNumberValue").val(--numberOfDisks);
        clearInterval(interval);
        createGame();
    }
});
$("#playAgain").click(function () {
    clearInterval(interval);
    stopGame();
    createGame();
});
createGame();
function startTimer() {
    var totalTime = 300;
    var timeLeftHtml = $("#timeLeft");
    var totalMins = Math.floor(totalTime / 60);
    var sec = totalTime - totalMins * 60;
    timeLeftHtml.html(totalMins + "min " + sec + "sec");
    interval = setInterval(checkInterval, 1000);
    function checkInterval() {
        --totalTime;
        if (totalTime >= 0) {
            var minutes = Math.floor(totalTime / 60);
            var seconds = totalTime - minutes * 60;
            timeLeftHtml.html(minutes + "min " + seconds + "sec");
        }
        if (totalTime == -1) {
            clearInterval(interval);
            alert("Time is Up!");
            stopGame();
        }
    }
}
function createGame() {
    emptyRods();
    startTimer();
    movesDone = 0;
    $("#moves > p").html(0);
    var createDisk = '';
    for (let i = numberOfDisks; i > 0; i--) {
        createDisk = '<div id="disk-' + (i) + '" class="disk">' + (i) + '</div>';
        $("#rod-1").append(createDisk);
    }
    enableDraggable($("#rod-1").children()[$("#rod-1").children().length - 1].id);
}
function stopGame() {
    for (let i = 1; i <= 3; i++) {
        let rodChilds = $("#rod-" + i).children();
        var rodChildsLength = rodChilds.length;
        if (rodChildsLength > 0) {
            for (let j = 0; j < rodChildsLength; j++) {
                if ($("#" + rodChilds[j].id).is('.ui-draggable')) {
                    $("#" + rodChilds[j].id).draggable("destroy");
                }
            }
        }
    }
}
function emptyRods() {
    for (let i = 1; i <= 3; i++) {
        let rodChilds = $("#rod-" + i).children();
        var rodChildsLength = rodChilds.length;
        if (rodChildsLength > 0) {
            for (let j = 0; j < rodChildsLength; j++) {
                rodChilds[j].remove();
            }
        }
    }
}
function enableDraggable(diskID) {
    if ($('#' + diskID).is('.ui-draggable-disabled')) {
        $('#' + diskID).draggable("enable");
    }
    else {
        $("#" + diskID).draggable({
            revert: "invalid",
            containment: ".container",
            cursor: "move",
            start: function (event, ui) {
                var parentRod = $(this)[0].parentElement.id;
                var currDisk = $(this)[0].id;
                for (let i = 1; i < 4; i++) {
                    if (("rod-" + i) != parentRod && checkDroppable(currDisk, ("rod-" + i))) {
                        enableDroppable(("rod-" + i));
                    }
                    else if (("rod-" + i) == parentRod && !($('#rod-' + i).is('.ui-droppable'))) {
                        enableDroppable(("rod-" + i));
                        $('#rod-' + i).droppable("disable");
                    }
                    else {
                        disableDroppable(("rod-" + i));
                    }
                }
            }
        });
    }
}
function enableDroppable(rodID) {
    if ($('#' + rodID).is('.ui-droppable-disabled')) {
        $('#' + rodID).droppable("enable");
    }
    else {
        $('#' + rodID).droppable({
            tolerance: "touch",
            drop: function (event, ui) {
                $("#moves > p").html(++movesDone);
                var diskMoved = event.originalEvent.target;
                $("#" + diskMoved.id).css({
                    left: 0,
                    top: 0
                });
                var diskPrevParent = $("#" + diskMoved.id).parent()[0].id;
                $("#" + this.id).append(diskMoved);
                var diskNewParent = $("#" + diskMoved.id).parent()[0].id;
                disableDraggable(diskNewParent);
                diskEnableDraggable(diskNewParent);
                if (checkWin()) {
                    setTimeout(() => {
                        clearInterval(interval);
                        alert("You Won!");
                        stopGame();
                    }, 100);
                }
            }
        });
    }
}
function checkDroppable(disk, rod) {
    var rodChildren = $("#" + rod).children();
    var rodChildrenLength = rodChildren.length;
    if (rodChildrenLength == 0) {
        return true;
    }
    else if (rodChildrenLength > 0 && rodChildren[rodChildrenLength - 1].innerHTML > $("#" + disk).html()) {
        return true;
    }
    else {
        return false;
    }
}
function diskEnableDraggable(rodID) {
    for (let i = 1; i <= 3; i++) {
        if ($("#rod-" + i) != rodID && $("#rod-" + i).children().length > 0) {
            enableDraggable($("#rod-" + i).children()[$("#rod-" + i).children().length - 1].id);
        }
    }
}
function disableDraggable(rodID) {
    var childArray = $("#" + rodID).children();
    if (childArray.length > 0) {
        for (let i = 0; i < childArray.length - 1; i++) {
            if ($('#' + childArray[i].id).is('.ui-draggable')) {
                $("#" + childArray[i].id).draggable("disable");
            }
        }
    }
}
function disableDroppable(rodID) {
    if ($('#' + rodID).is('.ui-droppable')) {
        $("#" + rodID).droppable("disable");
    }
}
function checkWin() {
    var totalDisks = numberOfDisks;
    var rod3Children = $("#rod-3").children();
    var rod3Length = rod3Children.length;
    if (rod3Length == totalDisks) {
        for (let i = 0; i < rod3Length; i++) {
            if (rod3Children[i].id != ("disk-" + (totalDisks--))) {
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}
function touchHandler(event) {
    var touch = event.changedTouches[0];
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);
    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}
function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}
init();