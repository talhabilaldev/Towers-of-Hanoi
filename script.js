var numberOfDisks = 3;
var movesDone = 0;
var interval = "";
function diskDown() {
    if ((numberOfDisks - 1) >= 3) {
        $("#diskNumberValue").val(--numberOfDisks);
        clearInterval(interval);
        createGame();
    }
}
function diskUp() {
    if ((numberOfDisks + 1) <= 9) {
        $("#diskNumberValue").val(++numberOfDisks);
        clearInterval(interval);
        createGame();
    }
}
function playAgain() {
    clearInterval(interval);
    stopGame();
    createGame();
}
function startTimer() {
    let totalTime = 10 + ((numberOfDisks - 3) * (Math.pow(10, 2)));
    let timeLeftHtml = $("#timeLeft");
    let totalMins = Math.floor(totalTime / 60);
    let sec = totalTime - totalMins * 60;
    timeLeftHtml.html(totalMins + "min " + sec + "sec");
    interval = setInterval(checkInterval, 1000);
    function checkInterval() {
        --totalTime;
        if (totalTime >= 0) {
            let minutes = Math.floor(totalTime / 60);
            let seconds = totalTime - minutes * 60;
            timeLeftHtml.html(minutes + "min " + seconds + "sec");
        }
        if (totalTime == -1) {
            clearInterval(interval);
            viewModal("Unfortunately, Time is Up!");
            stopGame();
        }
    }
}
function createGame() {
    emptyRods();
    startTimer();
    movesDone = 0;
    $("#moves > p").html(0);
    $("div").disableSelection();
    let createDisk = '';
    let width = $(".rod-container-content").width();
    const diskColors = ['756551', '695a49', '5d5040', '524639', '483d31', '3d352b', '382f25', '2c251c', '292218'];
    for (let i = numberOfDisks; i > 0; i--) {
        createDisk = '<div id="disk-' + (i) + '" class="disk">' + (i) + '</div>';
        $("#rod-1").append(createDisk);
        $("#disk-"+i).css("width",width+(i*4)+"px");
        $("#disk-"+i).css("background-color","#"+diskColors[i-1]);
    }
    let children = $("#rod-1").children();
    enableDraggable(children[children.length - 1].id);
}
function stopGame() {
    for (let i = 1; i <= 3; i++) {
        let rodChilds = $("#rod-" + i).children();
        let rodChildsLength = rodChilds.length;
        if (rodChildsLength > 0) {
            for (let j = 0; j < rodChildsLength; j++) {
                let child = $("#" + rodChilds[j].id);
                if (child.is('.ui-draggable')) {
                    child.draggable("destroy");
                }
            }
        }
    }
}
function emptyRods() {
    for (let i = 1; i <= 3; i++) {
        let rodChilds = $("#rod-" + i).children();
        let rodChildsLength = rodChilds.length;
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
                let parentRod = ui.helper[0].parentElement.id;
                let currDisk = ui.helper[0].id;
                for (let i = 1; i < 4; i++) {
                    let currRodID = "rod-" + i;
                    if (currRodID != parentRod && checkDroppable(currDisk, currRodID)) {
                        enableDroppable(currRodID);
                    }
                    else if (currRodID == parentRod && !($("#" + currRodID).is('.ui-droppable'))) {
                        enableDroppable(currRodID);
                        $('#rod-' + i).droppable("disable");
                    }
                    else {
                        disableDroppable(currRodID);
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
                console.log(event)
                console.log(ui)
                $("#moves > p").html(++movesDone);
                let diskMoved = ui.draggable[0];
                $("#" + diskMoved.id).css({
                    left: 0,
                    top: 0
                });
                $("#" + this.id).append(diskMoved);
                let diskNewParent = $("#" + diskMoved.id).parent()[0].id;
                disableDraggable(diskNewParent);
                diskEnableDraggable(diskNewParent);
                if (checkWin()) {
                    setTimeout(() => {
                        clearInterval(interval);
                        viewModal("Congratulations, You Won!");
                        stopGame();
                    }, 100);
                }
            }
        });
    }
}
function checkDroppable(disk, rod) {
    let rodChildren = $("#" + rod).children();
    let rodChildrenLength = rodChildren.length;
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
        let children = $("#rod-" + i).children();
        if ($("#rod-" + i) != rodID && children.length > 0) {
            enableDraggable(children[children.length - 1].id);
        }
    }
}
function disableDraggable(rodID) {
    let childArray = $("#" + rodID).children();
    if (childArray.length > 1) {
        $("#" + childArray[childArray.length - 2].id).draggable("disable");
    }
}
function disableDroppable(rodID) {
    if ($('#' + rodID).is('.ui-droppable')) {
        $("#" + rodID).droppable("disable");
    }
}
function checkWin() {
    let totalDisks = numberOfDisks;
    let rod3Children = $("#rod-3").children();
    let rod3Length = rod3Children.length;
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
function viewModal(text) {
    $("#textHere").html(text);
    $("#gameModal").modal();
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
createGame();
$("#diskUp").on("touchstart",diskUp);
$("#diskDown").on("touchstart",diskDown);
$(".playAgain").on("touchstart",playAgain);
$(".closeModal").on("touchstart",function(){ $("#gameModal").modal('hide'); })