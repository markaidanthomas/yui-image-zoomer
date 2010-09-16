
/**
 *
 * Base class for zooming images
 * <p>Usage: new YAHOO.widget.ImageZoom(imageContainerEl, {width:188, height:250});</p>
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.Lang
 * @constructor
 * @param {String or HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.
 * Each attribute is an object with at minimum a "to" or "by" member defined.
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").
 * @param {Number} width (required) width in pixels to reduce image to
 * @param {Number} height (required) height in pixels to reduce image to
 * @param {Number} loadingMessage (optional, defaults to "Loading image...") Message displayed whilst the image is downloading
 * @param {Number} increments (optional, defaults to 5) Number of increments for the animation, smaller is faster, 1 is instant
 * @param {Number} delay (optional, defaults to 20) Delay between calculations in milliseconds
 */
YAHOO.widget.ImageZoom = function(oEl, oAttributes){
    if(oEl){
        this.init(oEl, oAttributes);
    }
};

YAHOO.widget.ImageZoom.prototype = {
    init : function(oEl, oAttributes){
        if(typeof oEl == "string"){
            oEl = document.getElementById(oEl);
        }
        this.oEl           = oEl;
        this.oAttributes   = oAttributes;
        oEl.style.width    = oAttributes.width + "px";
        oEl.style.height   = oAttributes.height + "px";
        oEl.style.overflow = "hidden";
        var oLoading = document.createElement("span");
        oLoading.appendChild(document.createTextNode(oAttributes.loadingMessage || "loading image..."));
        oEl.appendChild(oLoading);
        YAHOO.util.Dom.addClass(oEl, "yLoading");
        this.oLoadTimer = YAHOO.lang.later(10, this, function(){
            if(this.oEl.getElementsByTagName("img")[0].complete){
                this.oLoadTimer.cancel();
                this.ready();
            }
        }, null, true);
    },
    ready : function(){
        this.nDelay            = this.oAttributes.delay || 20;
        this.nInc              = this.oAttributes.increments || 5;
        this.oImg              = this.oEl.getElementsByTagName("img")[0];
        this.nImgWidth         = this.oImg.offsetWidth;
        this.nImgHeight        = this.oImg.offsetHeight;
        this.nScale            = Math.min(this.oAttributes.width / this.nImgWidth, this.oAttributes.height / this.nImgHeight);
        this.oImg.style.width  = Math.floor(this.nImgWidth * this.nScale) + "px";
        this.oImg.style.height = Math.floor(this.nImgHeight * this.nScale) + "px";
        this.oImg.nCentreX     = Math.floor((this.oAttributes.width - (this.nImgWidth * this.nScale))/2);
        this.oImg.nCentreY     = Math.floor((this.oAttributes.height - (this.nImgHeight * this.nScale))/2);
        this.oImg.style.left   = this.oImg.nCentreX + "px";
        this.oImg.style.top    = this.oImg.nCentreY + "px";

        this.oImg.style.position     = "absolute";
        this.aMouse                    = [0,0];
        YAHOO.util.Event.addListener(this.oEl, "mousemove", this.onMove, this, true);
        this.nPercent = this.nScale * 100;
        var self = this;
        YAHOO.util.Event.addListener(this.oEl, "mouseover", function(e){
            if(this.oTimer){
                clearInterval(this.oTimer);
            }
            this.bOver = true;
            YAHOO.util.Event.stopPropagation(e);
            this.oTimer = setInterval(function(){self.animate()}, this.nDelay);
        }, this, true);
        YAHOO.util.Event.addListener(this.oEl, "mouseout", function(e){
            this.bOver = false;
            YAHOO.util.Event.stopPropagation(e);
        }, this, true);
        YAHOO.util.Dom.removeClass(this.oEl, "yLoading");
        this.oEl.removeChild(this.oEl.getElementsByTagName("span")[0]);
    },
    onMove : function(e){
         this.aMouse = YAHOO.util.Event.getXY(e);
    },
    animate : function(){
        var nTargetX, nTargetY, nTargetW, nTargetH, nStepX, nStepY, nStepW, nStepH;
        if(this.bOver){
            nTargetX = parseInt(this.oImg.style.width)/this.oAttributes.width * -(this.aMouse[0]-YAHOO.util.Dom.getX(this.oEl))/2;
            nTargetY = parseInt(this.oImg.style.height)/this.oAttributes.height * -(this.aMouse[1]-YAHOO.util.Dom.getY(this.oEl))/2;
            nTargetW = this.nImgWidth;
            nTargetH = this.nImgHeight;
        }else{
            nTargetX = this.oImg.nCentreX;
            nTargetY = this.oImg.nCentreY;
            nTargetW = Math.floor(this.nImgWidth * this.nScale);
            nTargetH = Math.floor(this.nImgHeight * this.nScale);
        };
        nStepX = ((this.oImg.offsetLeft) - nTargetX) / this.nInc;
        nStepY = ((this.oImg.offsetTop) - nTargetY) / this.nInc;
        nStepW = (this.oImg.offsetWidth - nTargetW) / this.nInc;
        nStepH = (this.oImg.offsetHeight - nTargetH) / this.nInc;
        this.oImg.style.left = parseInt((this.oImg.offsetLeft) - nStepX) + "px";
        this.oImg.style.top  = parseInt((this.oImg.offsetTop) - nStepY) + "px";
        this.oImg.style.width = parseInt(this.oImg.offsetWidth) - nStepW + "px";
        this.oImg.style.height = parseInt(this.oImg.offsetHeight) - nStepH + "px";
        if(parseInt(this.oImg.style.left) == 0){
            clearInterval(this.oTimer);
        }
    }
};