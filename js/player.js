'use strict';

var Player = (function() {
  
  // Globals
  var log, tv, screen, player;
  var playerUrl;

  var is4k = false;
  var isFullscreen = false;
  var isMinScreen = false; 
  
  var lastSelectedCategory;
 
  var defaultLoopValue=10000;
  var rewindValue=defaultLoopValue;
  var forwardValue=defaultLoopValue;  

  var rewindTimeout;
  var forwardTimeout;
  var numberKeyTimeout;
  var bottomChannelInfoTimeout;
  
  var numberKeyStack=""; 

  var audioTrack = 1; 
  
  // Retrun Player API
  return { 
    init: function(data) {
      tv = data; 
      player = UI.get('player');
      log = new Logger('player'); 
      Player.updatePlayerScreen();
      createEvents();
      log('ready'); 
    },
    updatePlayerScreen: function() {
      var playerBounds = player.getBoundingClientRect();
      // Set global screen
      screen = [
        playerBounds.left, playerBounds.top,
        playerBounds.width, playerBounds.height
      ];
      log('update player screen:', screen.join(', '));
      return screen;
    },
    numberKey:function(key){
      if(UI.isExitPanelVisible)
        return;  
      if(Settings.isSettingsPanelVisible())
        return;
    	var numberKeyPanel=UI.get("numberKeyPanel");
    	UI.show(numberKeyPanel);
    	if(numberKeyTimeout)
    		clearTimeout(numberKeyTimeout);
    	if(numberKeyStack.length==5)
    		numberKeyStack=""; 
    	numberKeyStack=numberKeyStack+key;  
    	numberKeyPanel.innerHTML=numberKeyStack;
    	numberKeyTimeout=setTimeout(function(){
    		var channelList = UI.get("channels"); 
    		var itemIndex=parseInt(numberKeyStack)-1; 
    		
    		numberKeyPanel.innerHTML="";
    		numberKeyStack=""; 
    		UI.hide(numberKeyPanel);
    		
    		if(itemIndex>channelList.children.length )
    			return; 
    		var url=channelList.children[itemIndex].dataset.url;
    		var name=channelList.children[itemIndex].dataset.name; 
    		UI.setSelectedChannel(channelList.children[itemIndex]);
    		if(url==null)
    			return;
        console.log(isFullscreen)
    		if (isFullscreen){ 
    			Player.play(url);
          Player.showBottomChannelInfo();
    		} 	 
    	}, 1500)
	  },
    next: function(jumpCount) {
      UI.next(jumpCount); 
    },
    prev: function(jumpCount) { 
      UI.prev(jumpCount); 
    },
    channelDown:function(){
      if(isFullscreen){
        UI.next(1);
        Player.enter(); 
      }
      else
        UI.nextDirect();
    },
    channelUp:function(){
      if(isFullscreen){
        UI.prev(1);
        Player.enter(); 
      }
      else  
        UI.prevDirect();
    }, 
    playInFullScreen:function(url){ 
      Player.setBottomChannelInfo();
      Player.showBottomChannelInfo();
      webapis.avplay.stop();
      webapis.avplay.close();  
      webapis.avplay.open(url);
      UI.playing(url); 
      playerUrl=url;  
      webapis.avplay.prepareAsync(function() {   
        webapis.avplay.play();  
      });
    },
    setBottomChannelInfo:function(no,name){
      no=no||UI.getSelectedChannel().children[0].innerHTML;
      name=name||UI.getSelectedChannel().children[1].innerHTML; 
      var logoContainer=UI.get("bottomChannelLogoContainer");
      logoContainer.classList.add("default-background-img");
      logoContainer.innerHTML="";
      var logo=UI.getSelectedChannel().dataset.logo; 
      Player.resetPlayerTimeControl(); 
      UI.get("bottomChannelInfoNumber").innerHTML=no; 
      UI.get("bottomChannelInfoName").innerHTML=name;
      if(logo==""||!logo.startsWith("http")) 
        return; 
      var img = document.createElement('img');
      img.onerror=function(){   
        this.onerror=null;
        this.style.display='none'; 
      }
      img.onload=function(){  
        logoContainer.classList.remove("default-background-img");
      }  
      img.src=logo;
      logoContainer.appendChild(img);
   
      
    },
    resetPlayerTimeControl:function(){
      document.getElementById("elapsed-time").innerHTML="00:00:00"; 
      document.getElementById("target-time").innerHTML="00:00:00";
      document.getElementById("total-time").innerHTML="00:00:00";
      document.getElementById("slider-bar").value=0;  
          document.getElementById("target-time").innerHTML="00:00:00";
          document.getElementById("target-time").style.left=0+"px"
    },
    showBottomChannelInfo:function(){ 
      if(bottomChannelInfoTimeout)
        clearTimeout(bottomChannelInfoTimeout);
      UI.show(UI.get("bottomChannelInfo")); 
      bottomChannelInfoTimeout=setTimeout(function () {
        UI.hide(UI.get("bottomChannelInfo"));
      },5000);
    },
    
    enter: function() {
      if(UI.isExitPanelVisible){
        document.querySelector('.choice-exit-buttton.selected').click();
        return;
      }  
      UI.blurElements(); 
      var channel = UI.channel; 
      if(channel.url==null){  
    	  lastSelectedCategory=UI.getSelectedChannel();  
    	  UI.setChannels(Parser.getCategories()[channel.name].child);  
      } 
      else{  
        if(isFullscreen){
          if(channel.url == playerUrl){ 
            Player.toggleMinScreen(); 
            console.log("toggleMinScreen"); 
            UI.refreshScroll();  
          } 
          else
            Player.play(channel.url);  
        }
        else if(channel.url == playerUrl){ 
          if(Player.state=="PAUSED") 
            webapis.avplay.play();
          else 
            Player.play(channel.url);  
          this.toggleFullscreen();
        } 
        else{ 
          Player.play(channel.url);
          this.toggleFullscreen(); 
        }  
      } 
    },
    back: function() {
      if(isMinScreen){
        this.toggleMinScreen();
        var playing=document.getElementById("channel-list").getElementsByClassName("playing")[0];
        UI.setSelectedChannel(playing);
      }  
    	else if(isFullscreen){  
        UI.message("");
        UI.hide(UI.get("bottomChannelInfo"));  
        if(Player.state=="PLAYING")
          webapis.avplay.pause();
        else{
          console.log(Player.state) 
          webapis.avplay.close();
          webapis.avplay.stop(); 
        }  
        if(isMinScreen)
          Player.toggleMinScreen();  
        UI.refreshScroll();
        var sidebar=document.getElementById("sidebar");
        sidebar.classList.remove("min");
        Player.toggleFullscreen(); 
    	}
      else if(lastSelectedCategory==null) { 
        UI.toggleExitPanel();
      }
    	else{   
    	  webapis.avplay.close();
        webapis.avplay.stop();
    		UI.setCategories(Parser.getCategories());  
        UI.setSelectedChannel(lastSelectedCategory); 
        lastSelectedCategory=null;   
        playerUrl=null; 
    	}  
    },
    play: function(url) {
      if (!url) { 
        log('play');
        UI.play();   
        return webapis.avplay.play();
      }    
      log('prepare and play:', url);
      playerUrl = url;
      audioTrack = 1;
      UI.playing(url);
      Player.setBottomChannelInfo(); 
      Player.showBottomChannelInfo() ; 
      webapis.avplay.stop();
      //webapis.avplay.close();   
      webapis.avplay.open(url);    
      webapis.avplay.prepareAsync(function() {  
        log("Statrt Prepare : ", url);
        webapis.avplay.play(); 
      });
    
       
      
    },
    playPause: function() {
      log('play/pause');
      return this.state == 'PLAYING' ? Player.pause() : Player.play();
    },
    pause: function() {
      log('pause');
      UI.pause();
      webapis.avplay.pause();
    },
    stop: function() {
      log('stop');
      UI.stop();
      webapis.avplay.stop();
    }, 
    foward: function() {
      Player.showBottomChannelInfo() 
      log("webapis.avplay.getDuration()  : "+webapis.avplay.getDuration());
	  if(Player.state!='PLAYING' && Player.state!='PAUSED'  )
  	  	return; 
	  if( webapis.avplay.getDuration()== 0)
		  return; 
      if (forwardTimeout) 
    	  clearTimeout(forwardTimeout); 
      if(Player.state!='PAUSED') 
    	  webapis.avplay.pause();  
      forwardValue+=forwardValue/10 ;  
      var destinationTime=webapis.avplay.getCurrentTime()+forwardValue; 
      Player.setTargetTime(destinationTime);
      forwardTimeout = setTimeout(function() { 
    	  webapis.avplay.jumpForward(forwardValue); 
    	  forwardValue=defaultLoopValue;  
        }, 1000); 
      log('foward:', forwardValue); 
    },
    rewind: function() { 
      Player.showBottomChannelInfo()  
	  if(Player.state!='PLAYING' && Player.state!='PAUSED' )
	  	  return;
	  if( webapis.avplay.getDuration()== 0)
		  return; 
      if (rewindTimeout) 
    	  clearTimeout(rewindTimeout);
      if(Player.state!='PAUSED' ) 
    	  webapis.avplay.pause(); 
      rewindValue+=rewindValue/10 ;
      var destinationTime=webapis.avplay.getCurrentTime()-rewindValue;
      if(destinationTime<0)
    	  destinationTime=0; 
      Player.setTargetTime(destinationTime); 
      rewindTimeout = setTimeout(function() { 
    	  webapis.avplay.jumpBackward(rewindValue); 
    	  rewindValue=defaultLoopValue; 
      }, 1000) 
      log('rewind:', rewindValue); 
    },
    mediaFoward: function() {
    	Player.showBottomChannelInfo(); 
    	if(Player.state!='PLAYING' )
    	  return;  
    	if( webapis.avplay.getDuration()== 0)
   		  return; 
        webapis.avplay.pause(); 
        var percent=webapis.avplay.getDuration()/100;
        var destinationTime=webapis.avplay.getCurrentTime()+percent; 
        this.setTargetTime(destinationTime);
        
        	webapis.avplay.jumpForward(percent); 
        log('mediaFoward:', destinationTime);
    },
    mediaRewind: function() { 
    	Player.showBottomChannelInfo(); 
  	  	if( Player.state!='PLAYING' )
  	  	  return; 
  	    if( webapis.avplay.getDuration()== 0)
   		  return; 
  	    webapis.avplay.pause(); 
	    var percent=webapis.avplay.getDuration()/100;
	    var destinationTime=webapis.avplay.getCurrentTime()-percent;
	    if(destinationTime<0) 
	    	destinationTime=0; 
	    Player.setTargetTime(destinationTime); 
	    webapis.avplay.jumpBackward(percent);  
        log('mediaRewind:', destinationTime); 
    },
    setTargetTime:function(destinationTime){ 
    	 var targetTime=new Date(destinationTime).toISOString().substr(11, 8); 
         document.getElementById("target-time").innerHTML=targetTime;
         var slider =document.getElementById("slider-bar") ;
         slider.value=destinationTime;
         var sliderPos = slider.value / slider.max;
         var pixelPostion = slider.clientWidth * sliderPos;
         document.getElementById("target-time").style.left=pixelPostion+"px"
    },
    set4k: function(value) {
      log('set 4k:', value);
      webapis.avplay.setStreamingProperty('SET_MODE_4K', value);
    },
    toggleSet4K:function(){
      is4k=!is4k; 
      if(is4k){
        Settings.settingsMessage("4K Mode ON !",5000);
      }else{
        Settings.settingsMessage("4K Mode OFF !"  ,5000);
      }
    },
    setTrack: function(type, index) {
      log('set track:', type, index);
      webapis.avplay.setSelectTrack(type, index);
      UI.setAudio(index);
    },
    nextAudio: function() {
      var list = [];
      var trackList = Player.getTracks();
      for (var i in trackList) {
        log('tracks:', trackList[i].type);
        if (trackList[i].type == 'AUDIO') list.push(trackList[i]);
      }
      var length = list.length;
      audioTrack++
      if (audioTrack > length) audioTrack = 1;
      log('set audio:', audioTrack);
      this.setTrack('AUDIO', audioTrack);
    },
    getTracks: function() {
      log('get tracks');
      return webapis.avplay.getTotalTrackInfo();
    },
    toggleMinScreen:function(){
      isMinScreen=!isMinScreen;
      var sidebar=document.getElementById("sidebar"); 
      if(isMinScreen){   
        sidebar.classList.add("min"); 
      }
      else{  
        sidebar.classList.remove("min");   
      } 
    },
    toggleFullscreen: function() {
      if (isFullscreen) { 
        UI.fullscreen(isFullscreen = false);
        // UI.get("bottomChannelInfo").classList.add("min");  
        webapis.avplay.setDisplayRect(0,0,0, 0); 
        
      } else {  
        UI.fullscreen(isFullscreen = true); 
        //UI.get("bottomChannelInfo").classList.remove("min");
        webapis.avplay.setDisplayRect(0, 0, tv.width, tv.height); 
        Player.showBottomChannelInfo() ;   
      }
    },
      
    get lastSelectedCategory(){
      return lastSelectedCategory;
    },
    set lastSelectedCategory(last){
      lastSelectedCategory=last;
    },
    get url() {
      return playerUrl;
    },
    get state() {
      return webapis.avplay.getState();
    },
    get isFullscreen(){
      return isFullscreen;
    },  
    get isMinScreen(){
      return isMinScreen;
    }
  };

  function createEvents(){
    var choiceExitYes=document.getElementById("choice-exit-yes");
    var choiceExitNo=document.getElementById("choice-exit-no");
    choiceExitYes.onclick=function(){
      window.tizen.application.getCurrentApplication().exit();
    }
    choiceExitNo.onclick=function(){
      UI.toggleExitPanel();
    }

    webapis.avplay.setListener({ 
      onbufferingstart: function() {
        UI.buffering('buffering start');
        log('buffering start');
      },
      onbufferingprogress: function(percent) {
        //log('buffering progress:', percent);
        UI.buffering('progress', percent);
      },
      onbufferingcomplete: function() { 	
        
        log('buffering complete'+ webapis.avplay.getState());
        if(webapis.avplay.getState()=="READY"|| webapis.avplay.getState()=="PLAYING"){  
            var time=new Date(webapis.avplay.getDuration()).toISOString().substr(11, 8);         
          document.getElementById("slider-bar").max=webapis.avplay.getDuration();  
          document.getElementById("total-time").innerHTML=time ;
          log('buffering complete'+ webapis.avplay.getDuration());
        }
        console.log("state : "+Player.state);
        UI.buffering('complete'); 
        webapis.avplay.play(); 
      },
       oncurrentplaytime: function(time) {  
       if(webapis.avplay.getState()=="PAUSED")
         return; 
       if(webapis.avplay.getDuration()!=0){
          document.getElementById("slider-bar").value=time;  
          Player.setTargetTime(time);
       } 
         var time=new Date(time).toISOString().substr(11, 8); 
         document.getElementById("elapsed-time").innerHTML=time;  
       },
      onevent: function (type, data) {
        log('event type:', type, 'data:', data);
      },
      onstreamcompleted: function() {  
        webapis.avplay.stop();
        log('stream compited'+Player.state); 
        webapis.avplay.prepareAsync(function() {  
          webapis.avplay.play();  
        } ); 
      },
      onerror: function (error) {
        log('event error:', error);
        webapis.avplay.stop(); 
        webapis.avplay.prepareAsync(function() {  
          webapis.avplay.play();  
        } ); 
      },
      
    
    }); 
  }

}());
