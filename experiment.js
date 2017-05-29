editor.setContents([
    {
        insert: "Whitesville DMV\nDepartment of Motor Vehicles\n\nLicenses / Permits\nSee Desks 1-3 to renew or replace your driver's license. Please have your 6-point ID ready when you reach the desk. You can also renew your license by a mail-in form that you can get at the front desk.\nSee Desk 4 to schedule a road or permit test. If you are taking a permit test, check in at the Testing Center downstairs. Road tests are conducted at the Springfield DMV.\n\nVehicle\nSee Desks 5-6 for vehicle ownership and registration issues. You can also renew your registration, pay tickets, and order license plates online at www.state.nj.us/mvc\n\nIf your issue is not listed here, ask the front desk for information."
    }
]);


function getURLParameter(theParameter) { 
  var params = window.location.search.substr(1).split('&');
 
  for (var i = 0; i < params.length; i++) {
    var p=params[i].split('=');
	if (p[0] == theParameter) {
	  return decodeURIComponent(p[1]);
	}
  }
  return false;
}


var experiment_use_hotplate = false;
var experimentGroup = getURLParameter("group");
if (experimentGroup == "a") {
    experiment_use_hotplate = true;
}

window.onload = function() {
//	document.querySelector(".ql-editor").focus();
    if (experiment_use_hotplate) {
        document.querySelector("#hotplate-button").click();
        document.querySelector("#survey-form-link").href = "https://goo.gl/forms/hyU5vJET7tTGGFdZ2";
    } else {
        look();
        document.querySelector("#hotplate-button").style.display = "none";
        document.querySelector("#visual-saliency-explainer").style.display = "none";
        document.querySelector("#survey-form-link").href = "https://goo.gl/forms/o53yYWXWg0lHhei62";
    }
//    editor.disable();
};



editor.disable();

document.querySelector("#intro-continue").addEventListener("click", function() {
    document.querySelector("#intro-text").classList.add("experiment-hide");
    setTimeout(function() {
        document.querySelector("#intro-text").style.display = "none";
        document.querySelector("#task-text").style.display = "block";
        setTimeout(function() {
            document.querySelector("#task-text").classList.add("experiment-show");
        }, 100);
    }, 500);
});

document.querySelector("#next-1").addEventListener("click", function() {
    document.querySelector("#next-1").style.visibility = "hidden";
    document.querySelector("p#next-1-target").classList.remove("experiment-hide");
    document.querySelector("#container").classList.remove("experiment-hide");
});

var taskStarted = false;

document.querySelector("#task-start-button").addEventListener("click", function() {
    if (!taskStarted) {
        startTimer();
    } else {
        /* finish task */
    }
});

var taskFinishTime;

function startTimer() {
    /* Enable editor */
    editor.enable();
    editor.focus();
    document.querySelector("#task-start-button").style.display = "none";
    document.querySelector("#container").classList.remove("experiment-disable");
    
    /* Make task-info fade */
    document.querySelector("#experiment-info").classList.add("fade");
    
    /* */
    document.querySelector("#task-time-container").classList.remove("experiment-hide");
    document.querySelector("#task-done-button").classList.remove("experiment-hide");
    document.querySelector("#pin-button").click();
    
    var currentTime = new Date();
    taskFinishTime = new Date(currentTime.getTime() + 600000);
    var x = setInterval(function() {
        var now = new Date().getTime(),
            distance = taskFinishTime - now,
            minutes = Math.floor((distance % (1000*60*60)) / (1000*60)),
            seconds = Math.floor((distance % (1000*60)) / 1000);
        
        if (minutes < 10) {minutes = "0" + minutes;}
        if (seconds < 10) {seconds = "0" + seconds;}
        
        document.querySelector("#task-time-remaining").innerHTML = minutes + ":" + seconds;
        
        if (distance < 0) {
            clearInterval(x);
            finishTask();
        }
    }, 1000);
}

document.querySelector("#task-done-button").addEventListener("click", function() {
    finishTask();
});

var finishTask = function() {
    editor.disable();
    document.querySelector("#container").classList.add("experiment-disable");
    document.querySelector("#experiment-info").classList.remove("fade");
    
    var ql = document.querySelector("#editor");
    domtoimage.toPng(ql, { bgcolor: "white" })
    .then(function (dataUrl) {
        var link = document.querySelector("#text-image-download");
        link.download = 'your-info-card-design';
        link.href = dataUrl;
    });
    
    document.querySelector("#task-text").classList.add("experiment-hide");
    setTimeout(function() {
        document.querySelector("#task-text").style.display = "none";
        document.querySelector("#final-text").style.display = "block";
        setTimeout(function() {
            document.querySelector("#final-text").classList.add("experiment-show");
        }, 100);
    }, 500);
}



