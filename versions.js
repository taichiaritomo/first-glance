/* Version object used for version control */
function Version(textContent, heatmap, thumbnail, domElement) {
    this.textContent = textContent;
    this.heatmap     = heatmap;
    this.thumbnail   = thumbnail;
    this.domElement  = domElement;
}

/* Lookas version controller
   Allows pinning versions of the note and toggling between
   previous versions and the current one.
   Instantiate with the versionsListElement, the DOM element
   that maintains the list of versions. */
var V_CTRL = {
    vListElement: document.querySelector("#versions-list"),
//    vCurrent: new Version(),
    size: 512, // size of version preview (square)
    currentVersion: 1,
    selectedVersion: 1,
    vSaved: {1: new Version(null, null, null, document.querySelector("#version-current"))},
    
    /* Update current version and UI
       @param textContent a delta of the current content in the text editor
       @param heatmap     the full-sized heatmap corresponding to the text content
       @param textImage   a downsampled rasterization of the text content
       @param saliencyMap raw saliency map for textImage */
    updateCurrent: function(textContent, textImage, heatmap) {
        
        this.ui_selectVersion(this.currentVersion)
        
        /* Update current version UI */
        var c = document.querySelector("#version-current");
        c.classList.add("selected");
        c.setAttribute("data-version", this.currentVersion);
        
        var t = textImage,
            canvas = c.querySelector("canvas"),
            context = canvas.getContext("2d"),
            imgData = context.createImageData(this.size, this.size);
        canvas.width = 512;
        canvas.height = 512;
        
        if (heatmap != null) {
            var h = heatmap.data;
            // Multiply-blend the textImage and saliencyMap
            for (var i = 0; i < imgData.data.length; i+=4) {
                imgData.data[i]   = (t[i] * h[i])   / 255;
                imgData.data[i+1] = (t[i] * h[i+1]) / 255;
                imgData.data[i+2] = (t[i] * h[i+2]) / 255;
                imgData.data[i+3] = 255;
            }
        } else {
            for (var i = 0; i < imgData.data.length; i+=4) {
                imgData.data[i]   = t[i];
                imgData.data[i+1] = t[i];
                imgData.data[i+2] = t[i];
                imgData.data[i+3] = 255;
            }
        }
        context.putImageData(imgData, 0, 0);
        
        /* Update current version cache */
        this.vSaved[this.currentVersion].textContent = textContent;
        this.vSaved[this.currentVersion].heatmap     = heatmap;
        this.vSaved[this.currentVersion].thumbnail   = imgData.data;
    },
    
    /* Adds cached current version to list */
    pinVersion: function() {
        /* get current version */
        var ver = this.currentVersion,
            c = this.vSaved[ver];
        
        /* increase version number and assign to current version */
        this.currentVersion++;
        this.selectedVersion = this.currentVersion;
        this.vSaved[this.currentVersion] = new Version(c.textContent, c.heatmap, c.thumbnail, c.domElement);
        document.querySelector("#version-current").setAttribute("data-version", this.currentVersion);
        
        /* create a version-preview element for the pinned version */
        var e = document.createElement('div');
        e.classList.add("version-preview");
        var id = "version-" + ver;
        e.setAttribute("id", id);
        e.setAttribute("data-version", ver);
        e.innerHTML =
            '<canvas class="version-preview-thumbnail"></canvas>'+
            '<div class="version-preview-label">v'+ver+'</div>';
        document.querySelector("#version-current").insertAdjacentHTML("afterend", e.outerHTML);
        e = document.querySelector("#version-"+ver);
        this.vSaved[ver].domElement = e;
        
        /* insert thumbnail into new version-preview element */
        var thumbnail = c.thumbnail,
            canvas = e.querySelector("canvas"),
            context = canvas.getContext("2d"),
            imgData = context.createImageData(this.size, this.size);
        canvas.width = 512;
        canvas.height = 512;
        for (var i = 0; i < imgData.data.length; i+=4) {
            imgData.data[i]   = thumbnail[i];
            imgData.data[i+1] = thumbnail[i+1];
            imgData.data[i+2] = thumbnail[i+2];
            imgData.data[i+3] = thumbnail[i+3];
        }
        context.putImageData(imgData, 0, 0);
        
        /* use css transition to animate insertion */
        setTimeout(function() {
            e.classList.add("inserted");
        }, 0);
        
        /* change helptext style if necessary */
        this.ui_helptextFade();
    },
    
    deleteVersion: function(v_num) {
        var v = this.vSaved[v_num],
            e = v.domElement;
        e.classList.remove("inserted"); // use css class transition to animate removal
        setTimeout(function() { e.remove(); }, 100); // remove dom element
        delete this.vSaved[v_num]; // destroy cached version
        this.ui_helptextFade(); // change helptext style if necessary
        
//        this.selectedVersion = this.currentVersion;
//        this.ui_selectVersion(this.currentVersion);
    },
    
    /* Loads a saved version from the list to the editor
       Replaces editor content with version's text content
       and bypasses heat view (if on) to immediately show
       heatmap.
       @param v_num the version number to load*/
    loadVersion: function(v_num) {
        var v = V_CTRL.vSaved[v_num];
        editor.setContents(v.textContent, "api");
        
        if (v.heatmap != null) {
            var canvas = document.querySelector("#heatmap"),
            context = canvas.getContext("2d");
            context.putImageData(v.heatmap, 0, 0);
        }
    },
    
    ui_selectVersion: function(v_num) {
        /* deselect currently selected version */
        if (this.vSaved[this.selectedVersion] != null) {
            this.vSaved[this.selectedVersion].domElement.classList.remove("selected");
        }
        
        /* select input version */
        this.selectedVersion = v_num;
        this.vSaved[v_num].domElement.classList.add("selected");
        
        /* indicate active pin button for saved versions */
        if (this.selectedVersion < this.currentVersion) {
            document.querySelector("#pin-button").classList.add("ql-active");
        } else {
            document.querySelector("#pin-button").classList.remove("ql-active");
        }
    },
    
    ui_helptextFade: function() {
        if (Object.keys(this.vSaved).length > 2) {
            var helptext = document.querySelector("#versions-helptext");
            helptext.classList.remove("fade");
            helptext.classList.add("hide");
        }
    }
}

document.querySelector("#pin-button").addEventListener("click", function() {
    if (V_CTRL.selectedVersion < V_CTRL.currentVersion) {
        V_CTRL.deleteVersion(V_CTRL.selectedVersion);
    } else {
        V_CTRL.pinVersion();
    }
});

document.querySelector("#versions-list").addEventListener("click", function(e) {
    var v = e.target.getAttribute("data-version");
    console.log(e);
    V_CTRL.ui_selectVersion(v);
    V_CTRL.loadVersion(v);
});

