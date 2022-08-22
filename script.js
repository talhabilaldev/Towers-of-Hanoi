var numberOfDisks = 3;
var movesDone = interval = 0;
const undoArray = [];
const redoArray = [];
function startTimer() {
    let totalTime = 60 + ((numberOfDisks - 3) * (Math.pow(12, 2)));
    function checkInterval() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime - minutes * 60;
        $("#timeLeft").html(minutes + "min " + seconds + "sec");
        if (totalTime == 0) {
            clearInterval(interval);
            viewModal("Unfortunately, Time is Up!");
            stopGame();
        }
        totalTime--;
    }
    checkInterval();
    interval = setInterval(checkInterval, 1000);
}
function createGame() {
    emptyRods();
    startTimer();
    emptyArrays(undoArray);
    emptyArrays(redoArray);
    changeUpDownDiskColor();
    movesDone = 0;
    $("#moves > p").html(0);
    $("div").disableSelection();
    let createDisk = '';
    let width = $(".rod-container-content").width();
    const diskColors = ['756551', '695a49', '5d5040', '524639', '483d31', '3d352b', '382f25', '2c251c', '292218'];
    for (let i = numberOfDisks; i > 0; i--) {
        createDisk = '<div id="disk-' + i + '" class="disk">' + i + '</div>';
        $("#rod-1").append(createDisk);
        $("#disk-"+i).css("width",width+(i*5)+"px");
        $("#disk-"+i).css("background-color","#"+diskColors[i-1]);
    }
    let children = $("#rod-1").children();
    enableDraggable(children[children.length - 1].id);
}
function stopGame() {
    for (let i = 1; i <= 3; i++) {
        let rodChilds = $("#rod-" + i).children();
        if (rodChilds.length > 0) {
            for (let j = 0; j < rodChilds.length; j++) {
                let child = $("#" + rodChilds[j].id);
                if (child.is('.ui-draggable')) {
                    child.draggable("destroy");
                }
            }
        }
    }
    emptyArrays(undoArray);
    emptyArrays(redoArray);
}
function enableDraggable(diskID) {
    $("#" + diskID).draggable({
        revert: "invalid",
        containment: ".container",
        cursor: "move",
        start: function (event, ui) {
            let currDisk = ui.helper[0].id;
            for (let i = 1; i <= 3; i++) {
                let currRodID = "rod-" + i;
                if (checkDroppable(currDisk, currRodID)) {
                    enableDroppable(currRodID);
                }
                else if($("#"+currRodID).is('.ui-droppable')){
                    $("#"+currRodID).droppable("destroy");
                }
            }
        }
    });
}
function enableDroppable(rodID) {
    $('#' + rodID).droppable({
        tolerance: "touch",
        drop: function (event, ui) {
            $("#moves > p").html(++movesDone);
            let diskMoved = ui.draggable[0];
            $("#" + diskMoved.id).css({
                left: 0,
                top: 0
            });
            let diskPrevParent = $("#" + diskMoved.id).parent()[0].id;
            $("#" + this.id).append(diskMoved);
            let diskNewParent = $("#" + diskMoved.id).parent()[0].id;
            undoArray.push({
                diskPrevParent: diskPrevParent,
                diskNewParent: diskNewParent,
                diskID: diskMoved.id
            });
            diskDisableDraggable(diskNewParent);
            diskEnableDraggable(diskNewParent);
            emptyArrays(redoArray);
            checkWin();
        }
    });
}
function checkDroppable(disk, rod) {
    let rodChildren = $("#" + rod).children();
    if ((rodChildren.length == 0) || (rodChildren.length > 0 && rodChildren[rodChildren.length - 1].innerHTML > $("#" + disk).html()) ) {
        return true;
    }
    else {
        return false;
    }
}
function diskEnableDraggable(rodID) {
    for (let i = 1; i <= 3; i++) {
        let children = $("#rod-" + i).children();
        if (children.length > 0) {
            enableDraggable(children[children.length - 1].id);
        }
    }
}
function diskDisableDraggable(rodID) {
    let childArray = $("#" + rodID).children();
    if (childArray.length > 1) {
        $("#" + childArray[childArray.length - 2].id).draggable("destroy");
    }
}
function checkWin() {
    let totalDisks = numberOfDisks;
    let rod3Children = $("#rod-3").children();
    let rod3Length = rod3Children.length;
    if (rod3Length == numberOfDisks) {
        let won = true;
        for (let i = 0; i < rod3Length; i++) {
            if (rod3Children[i].id != ("disk-" + (totalDisks--))) {
                won = false;
            }
        }
        if(won){
            setTimeout(() => {
                clearInterval(interval);
                stopGame();
                viewModal("Congratulations, You Won!");
            }, 100);
        }
    }
}
function emptyRods() {
    for (let i = 1; i <= 3; i++) {
        let rodChilds = $("#rod-" + i).children();
        if (rodChilds.length > 0) {
            for (let j = 0; j < rodChilds.length; j++) {
                rodChilds[j].remove();
            }
        }
    }
}
function emptyArrays(array){
    while(array.length > 0) {
        array.pop();
    }
    changeUndoRedoColor();
}
function undo(){
    if(undoArray.length>0){
        let move = undoArray.pop();
        $("#"+move.diskPrevParent).append($("#"+move.diskID));
        diskDisableDraggable(move.diskPrevParent);
        diskEnableDraggable(move.diskPrevParent);
        redoArray.push({
            diskPrevParent: move.diskNewParent,
            diskNewParent: move.diskPrevParent,
            diskID: move.diskID
        });
        changeUndoRedoColor();
    }
}
function redo(){
    if(redoArray.length>0){
        let move = redoArray.pop();
        $("#"+move.diskPrevParent).append($("#"+move.diskID));
        diskDisableDraggable(move.diskPrevParent);
        diskEnableDraggable(move.diskPrevParent);
        undoArray.push({
            diskPrevParent: move.diskNewParent,
            diskNewParent: move.diskPrevParent,
            diskID: move.diskID
        });
        changeUndoRedoColor();
    }
}
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
function changeUpDownDiskColor(){
    numberOfDisks==3 ? $("#diskDown").addClass("disabledClass") : $("#diskDown").removeClass("disabledClass");
    numberOfDisks==9 ? $("#diskUp").addClass("disabledClass") : $("#diskUp").removeClass("disabledClass");
}
function changeUndoRedoColor(){
    undoArray.length>0 ? $("#undo-btn").removeClass("disabledClass") : $("#undo-btn").addClass("disabledClass");
    redoArray.length>0 ? $("#redo-btn").removeClass("disabledClass") : $("#redo-btn").addClass("disabledClass");
}
function viewModal(text) {
    $("#textHere").html(text);
    $("#gameModal").modal().css({
        "display" : "flex",
        "justify-content" : "center",
        "align-items" : "center"
    });
}
createGame();