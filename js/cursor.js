var Cursor = (function() {
    var cursorVisible=false;
    var cursorIncraseConstant=10;
    var cursorIncraseTimeout; 
    var cursorIncraseDelay=500; 
    var lastDirecton="";
    var lastElement=document.body;
    var cursorVisible=false;  
     
 
    function incraseCursorConstant(){
        if(cursorIncraseTimeout){
            clearTimeout(cursorIncraseTimeout); 
        }
        cursorIncraseConstant+=cursorIncraseConstant/3;
        cursorIncraseTimeout=setTimeout(function(){
            cursorIncraseConstant=10;
        },cursorIncraseDelay);  
    }
    function checkOverflowAndUpdate(){
        var cursor=document.getElementById("cursor");  
        
        if(cursor.offsetTop<0){
            cursor.style.top="0px";
        }
        else if(cursor.offsetLeft<0){
            cursor.style.left="0px";
        }  
        else if(cursor.offsetTop+10 > App.resolution.height){
            cursor.style.top=App.resolution.height-10+"px";
        }
        else if(cursor.offsetLeft+10>App.resolution.width){
            cursor.style.left=App.resolution.width-10+"px";
        } 
    }
    function triggerMouseEnter(element,lastElement,coordinate){   
        dispatchMouseEvent(element,"mouseenter",false,coordinate);  // lastElement > element
        while(element.parentNode&&element.parentNode!=lastElement ){  
            element=element.parentNode; 
            dispatchMouseEvent(element,"mouseenter",false,coordinate);
        } 
    } 
    function triggerMouseLeave(element,lastElement,coordinate){  // element > lastElement
        dispatchMouseEvent(lastElement,"mouseleave",false,coordinate);
        while(lastElement.parentNode&&lastElement.parentNode!=element){ 
            lastElement=lastElement.parentNode;
            dispatchMouseEvent(lastElement,"mouseleave",false,coordinate);
        } 
    }

    function triggerMouseOver(element,coordinate){ 
        dispatchMouseEvent(element,"mouseover",true,coordinate);
    }
  
    function triggerClick(element,coordinate){ 
        document.activeElement.blur();  
        element.focus();
        dispatchMouseEvent(element,"mousedown",true);  
    }
     
    function triggerFocus(element) {
        const event = new FocusEvent('focus', {
            view: window,
            bubbles: true,
            cancelable: true
        }); 
        element.dispatchEvent(event);
        element.focus(); 
    }
    
    function dispatchMouseEvent(element,event,bubbles,coordinate){
        var event; 
        event = new MouseEvent(event, {
            'view': window,
            'bubbles': bubbles,
            'cancelable': true, 
        });  
        element.dispatchEvent(event); 
    }
     
    var cursor ={

        hideCursor:function() { 
            var cursor=document.getElementById("cursor"); 
            coordinate={x:0,y:0};
            var element=document.body;
            if(!lastElement)
                lastElement=element; 
            triggerMouseLeave(element,lastElement,coordinate);
            lastElement=element;
            // cursor.style.left="50%";
            // cursor.style.top="50%";
            //this.move();
            UI.hide(cursor); 
            cursorVisible=false;   
        },
      
        showCursor:function(){ 
            var cursor=document.getElementById("cursor"); 
            UI.show(cursor);
            cursorVisible=true; 
            this.move();  
        },
      
        toggleVisibleCursor:function(){ 
            if(cursorVisible){
                this.hideCursor();
                console.log("geldi");
            } 
            else
                this.showCursor(); 
        },
      
        isCursorVisible:function(){
            return cursorVisible;
        },

        move:function(direction){
            var cursor=document.getElementById("cursor"); 
            if(lastDirecton!=direction){
                cursorIncraseConstant=10;
            }
            if(direction=="up"){
              var top=cursor.offsetTop-cursorIncraseConstant;
              cursor.style.top=cursor.offsetTop-cursorIncraseConstant+"px";
            }
            if(direction=="right"){
              cursor.style.left=cursor.offsetLeft+cursorIncraseConstant+"px";
            }
            if(direction=="down"){
              cursor.style.top=cursor.offsetTop+cursorIncraseConstant+"px";
            }
            if(direction=="left"){ 
              cursor.style.left=cursor.offsetLeft-cursorIncraseConstant+"px";
            }
            checkOverflowAndUpdate();
            incraseCursorConstant(); 
            lastDirecton=direction;

            coordinate={x:cursor.offsetLeft-1,y:cursor.offsetTop-2};
            var element=document.elementFromPoint(coordinate.x,coordinate.y); 
            
            if(element==null)
                return;  
            
            if(!lastElement)
                lastElement=document.body; 
            if(element!=lastElement){  
                if(element.contains(lastElement)){ 
                    triggerMouseLeave(element,lastElement,coordinate);  
                    //triggerMouseOut(element,lastElement,coordinate);
                }   
                else if(lastElement.contains(element)){
                    //triggerPointerEnter(element,lastElement,coordinate);
                    triggerMouseEnter(element,lastElement,coordinate); 
                }  
                     
                else{   
                    while(!lastElement.contains(element)){
                        dispatchMouseEvent(lastElement,"mouseleave",false,coordinate);
                        //dispatchMouseEvent(lastElement,"mouseout",false,coordinate);
                        lastElement=lastElement.parentNode; 
                    } 
                    triggerMouseEnter(element,lastElement,coordinate); 
                    //triggerPointerEnter(element,lastElement,coordinate);
                    //dispatchMouseEvent(element,"mouseenter",false);
                    //dispatchMouseEvent(lastElement,"mouseleave",false);
                }     
            } 
            //triggerPointerOver(element,coordinate);
            triggerMouseOver(element,coordinate); 
            lastElement=element;
            //element.focus(); 
        }, 
        click:function(){  
            var cursor=document.getElementById("cursor");   
            var element=document.elementFromPoint(cursor.offsetLeft-1,cursor.offsetTop-2); 
            triggerClick(element,{x:cursor.offsetLeft-1,y:cursor.offsetTop-2});
        },
        isVisible(){
            return cursorVisible;
        },
        togleVisible(){
            cursorVisible=!cursorVisible;
        }
    }; 
    
    return cursor;
  
  }());