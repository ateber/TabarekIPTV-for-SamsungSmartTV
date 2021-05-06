'use strict';

var UI = (function() {

  // Globals
  var log, selectedChannel, messageTimeouts={}, messageDotIntervals={};
  var dom = {};  
  var channelStack=[];
  var categoryStack=[];
  var isExitPanelVisible=false;
  var isSearchPanelVisible=false;
  var playerTimeControlTimeout; 
  var displayingRows=[];  
  var fitContent={row:0,column:0,count:0}

  function scrollChannels() { 
    for(var i in displayingRows)
      displayingRows[i].style.display="none";
    
    if(selectedChannel.dataset.url!=null){
      for(var i in displayingRows)
        clearLogo(displayingRows[i]); 
    } 
    displayingRows=[];  
    var channelList = dom.channels;
    var sidebar = dom.sidebar; 
    var itemIndex = selectedChannel.firstChild.innerHTML-1; 
    selectedChannel.classList.remove("selected"); 
    selectedChannel.style.display=""; 
    displayingRows.push(selectedChannel); 
    var selectedChannelStyle=window.getComputedStyle(selectedChannel);
    var itemHeight=selectedChannel.offsetHeight+parseFloat(selectedChannelStyle.marginTop)+parseFloat(selectedChannelStyle.marginBottom);  
    var itemWidth=selectedChannel.offsetWidth+parseFloat(selectedChannelStyle.marginLeft)+parseFloat(selectedChannelStyle.marginRight);  
    var listWidth=document.getElementById("channel-list").offsetWidth;
    var listHeight = sidebar.offsetHeight; 
    fitContent.row=parseInt(listWidth/itemWidth);
    fitContent.column=parseInt(listHeight/itemHeight);
    fitContent.count=fitContent.column*fitContent.row; 
    selectedChannel.classList.add("selected");   
    
    var nextElement=selectedChannel;
    var backElement=selectedChannel;  
     
    var overflow=itemIndex%(fitContent.count);   
    for(var i=0;i<overflow;i++){
      if(!backElement.previousSibling)
        break;
      backElement=backElement.previousSibling; 
      backElement.style.display=""; 
      displayingRows.push(backElement); 
    }

    for(var i=overflow;i<(fitContent.count-1);i++){ 
      if (!nextElement.nextSibling)
        break; 
      nextElement=nextElement.nextSibling;
      nextElement.style.display="";
      displayingRows.push(nextElement); 
    } 
    
    var currentRowIndex=parseInt(itemIndex/fitContent.row);
    var lastRowIndex = parseInt((channelList.lastChild.firstChild.innerHTML-1)/fitContent.row); 
    var nextRowIndex = parseInt((nextElement.firstChild.innerHTML-1)/fitContent.row); 
    var backRowIndex = parseInt((backElement.firstChild.innerHTML-1)/fitContent.row);  
    document.getElementById("top-sidebar").style.height=backRowIndex*itemHeight+"px";   
    document.getElementById("bottom-sidebar").style.height=(lastRowIndex-nextRowIndex)*itemHeight+"px";
    
   
    for(var i=0;i<fitContent.count;i++){
      if (nextElement&&nextElement.nextSibling){  
        nextElement=nextElement.nextSibling; 
        displayingRows.push(nextElement);  
      }   
    }

    if(selectedChannel.dataset.url!=null){
      for(var i in displayingRows)
        createLogo(displayingRows[i]); 
    } 
    
    var scroll = itemHeight*(fitContent.column*parseInt(currentRowIndex/fitContent.column))  ;  
    sidebar.scrollTop = scroll; 
  }


  function createLogo(channel){
    if(channel.dataset.logo==""||!channel.dataset.logo.startsWith("http"))
      return;
    var logoContainer=channel.children[2];
    if(logoContainer.firstChild ){ 
      return;
    } 

    var logo = document.createElement('img');
    logo.onerror=function(){
      this.onerror=null;   
      this.style.display='none';   
      console.log("gelior : "+this.src);
    }
    logo.onload=function(){  
      logoContainer.classList.remove("default-background-img");
    } 
    logo.setAttribute('src', channel.dataset.logo );
    logoContainer.append(logo); 
  }


  function clearLogo(channel){
    var logoContainer=channel.children[2]; 
  }
  
  function createDotAnimation (message,messageId,data){
    var dotNumber=0; 
    messageDotIntervals[messageId]=setInterval(function(){ 
      var space="<span style='color:transparent;backgroundcolor:transparent;'>&nbsp;.&nbsp;</span>".repeat(3); 
      message.innerHTML=space+data+"<span>&nbsp;.&nbsp;</span>".repeat(dotNumber)+"<span style='color:transparent;backgroundcolor:transparent;'>&nbsp;.&nbsp;</span>".repeat(3-dotNumber);
      dotNumber++;
      if(dotNumber==4)
        dotNumber=0;
    }, 250);
  } 

  // Round shortcut 
  function int(number) {
    return Math.round(number);
    
  }

  // Return UI API
  return { 
      show:function(element){
        element.classList.remove('hide');
      },
      hide:function(element){
        element.classList.add('hide');
      },
      get isSearchPanelVisible(){
        return isSearchPanelVisible;
      },
      get isExitPanelVisible(){
        return isExitPanelVisible;
      },
      get fitContent(){
        return fitContent;
      },
      toggleSearchPanel:function(){
        isSearchPanelVisible=!isSearchPanelVisible;
        var searchPanel=document.getElementById("search-panel");
        var searchInput=document.getElementById("search-input"); 
        Cursor.hideCursor(); 
        // Cursor.toggleVisibleCursor(); 
        if(isSearchPanelVisible){
          UI.show(searchPanel);
          searchInput.focus();
        } 
        else
          UI.hide(searchPanel);  
      }, 
      toggleExitPanel:function(){
        isExitPanelVisible=!isExitPanelVisible;
        var exitPanel=document.getElementById("choice-exit");
        Cursor.hideCursor();
        this.selectExitChoice(true);
        if(isExitPanelVisible)
          UI.show(exitPanel);
        else
          UI.hide(exitPanel);  
      },
      selectExitChoice:function(choice){
        if(choice){
          document.getElementById("choice-exit-no").classList.remove("selected");
          document.getElementById("choice-exit-yes").classList.add("selected");
        }
        else {
          document.getElementById("choice-exit-yes").classList.remove("selected");
          document.getElementById("choice-exit-no").classList.add("selected");
        }  
      },
      getScroll:function ()  {
        return dom.sidebar.scrollTop ;
      },
      setScroll:function (scroll) {
        dom.sidebar.scrollTop=scroll ;
      }, 
      init: function() {  
        dom = { 
          channelCount: document.getElementById('channel-count'),
          player: document.getElementById('av-player'),
          sidebar: document.querySelector('.sidebar'),
          channels: document.getElementById('channel-list'), 
          message: document.getElementById('message'),
          tvMessage:document.getElementById('tv-message'),
          header:document.getElementById('header'),
          section:document.getElementById('section'),
          info:document.getElementById("info"),
          log: document.getElementById('log'),
          playerTimeControl: document.getElementById('player-time-control'),
          numberKeyPanel: document.getElementById("number-key-panel"), 
          bottomChannelInfo: document.getElementById("bottom-channel-info"),
          bottomChannelInfoNumber: document.getElementById("bottom-channel-info-number") ,
          bottomChannelInfoName: document.getElementById("bottom-channel-info-name"),
          bottomChannelLogoContainer: document.getElementById("bottom-channel-logo")  
        }; 
        log = new Logger('ui');
        log('ready');
      },
      playerTimeControlShow:function(){
        if (playerTimeControlTimeout) 
            clearTimeout(playerTimeControlTimeout);
        UI.get('playerTimeControl').classList.remove('hide');
        playerTimeControlTimeout = setTimeout(function() {  
            UI.get('playerTimeControl').classList.add('hide');  
          }, 6000); 
      },
      playing: function(url) {
        var item;
        item = dom.channels.querySelector('li.playing');
        if (item) item.classList.remove('playing');
        if (!url) return; 
        item = dom.channels.querySelector('li[data-url="' + url + '"]');
        
        if (item) item.classList.add('playing');
        var message=this.message('Loading "' + item.dataset.name + '"', 600000,true ); 
      },
      play: function() {
        this.message('Play');
      },
      stop: function() {
        this.message('Stop');
      },
      pause: function() {
        this.message('Pause');
      },
      buffering: function(state, data) { 
        if (state == 'progress') {
          this.message('Buffering: ' + data + '%',1000);
        } else if (state == 'complete') {
          this.message();
        }
      },
      findMessage:function(messageId){ 
        return document.getElementById("info_message_"+messageId);
      },
      message: function(data, timeout,dotAnimation,messageId) { 
        messageId=messageId||0;
        var message =this.findMessage(messageId);
        if(message==null){
          message=document.createElement("div");
          message.id="info_message_"+messageId;
          message.classList.add("message"); 
        } 
        info.prepend(message);
        
        if(messageDotIntervals[messageId]) clearInterval(messageDotIntervals[messageId]);
        if (messageTimeouts[messageId]) clearTimeout(messageTimeouts[messageId]); 
        if (!data) return message.classList.add('hide');  
        
        if(dotAnimation==true){
          var space="<span style='color:transparent;backgroundcolor:transparent;'>&nbsp;.&nbsp;</span>".repeat(3);
          message.innerHTML =space+data+space;
          createDotAnimation(message,messageId,data);
        }     
        else
          message.innerHTML = data;
        message.classList.remove('hide'); 
        messageTimeouts[messageId] = setTimeout(function() {
          if(messageDotIntervals[messageId])
            clearInterval(messageDotIntervals[messageId]);
          message.classList.add('hide');
        }, timeout || 3000);
        return message;
      }, 
      fullscreen: function(is) {
        dom.player.classList[is ? 'add' : 'remove']('fullscreen');
        dom.info.classList[is ? 'add' : 'remove']('fullscreen');
      },
      setAudio: function(no) {
        this.message('Audio Track: ' + no);
      },
      // Set channel list
      setCategories: function(categoryList) { 
        var channels = dom.channels;  
        channels.innerHTML = '';
        channels.classList.remove("channel");
        dom.header.classList.remove("channel");
        dom.section.classList.remove("channel");
        dom.sidebar.classList.remove("channel");
        var rowNumber=0; 
        //var data=[];
        for (var category in categoryList) {
          category = categoryList[category];  
          if(Settings.blacklistCategoryKeys[category.name])
            continue;
          var li = document.createElement('li');
          var divNumber = document.createElement('div');
          var divName = document.createElement('div'); 
          var divCategoryChannelCount = document.createElement('div'); 
          divNumber.classList.add('channel-list-number');
          divCategoryChannelCount.classList.add('category-channel-count'); 
          divName.classList.add('category-list-name');  
          rowNumber++;
          var contentCount=0;
          var childChannels=Parser.getCategories()[category.name].child;
          var totalChannelCount=Object.keys(childChannels).length;   
          for(var channel in childChannels){
            if(!Settings.blacklistChannelLinkKeys[channel])
              contentCount++;
          } 
          
          li.dataset.name = category.name;  
          divNumber.innerHTML= rowNumber ;  
         
          divCategoryChannelCount.innerHTML="[&nbsp;&nbsp;"+totalChannelCount+"&nbsp;&nbsp;]";  

          if(category.name=="ALL")
            divName.innerHTML="&bull;&nbsp;&nbsp;ALL&nbsp;&nbsp;&bull;"
          else
            divName.innerHTML = category.name ;
          
          li.appendChild(divNumber);
          li.appendChild(divName); 
          li.appendChild(divCategoryChannelCount);  
          li.style.display="none";
           
          channels.appendChild(li);  
        }  
        //sortList();
        //this.next();
      }, 

      setChannels: function(channelList) {  
        var channels = dom.channels;
        channels.classList.add("channel"); 
        dom.header.classList.add("channel");
        dom.section.classList.add("channel");
        dom.sidebar.classList.add("channel");
        channels.innerHTML = '';
        var rowNumber=0;  
        for (var channel in channelList) {  
          channel = channelList[channel];  
          if(Settings.blacklistChannelLinkKeys[channel.url])
            continue;
          var li = document.createElement('li');
          var divNumber = document.createElement('div');
          var divName = document.createElement('div');
          var logoDiv = document.createElement('div');
           
          divNumber.classList.add('channel-list-number'); 
          divName.classList.add('channel-list-name'); 
        
          logoDiv.classList.add('channel-logo');
          logoDiv.classList.add('default-background-img'); 
          
          rowNumber++;
          li.dataset.name = channel.name;  
          li.dataset.url = channel.url;
          li.dataset.logo = channel.logo;    
          divName.innerHTML =  channel.name;
          divNumber.innerHTML= rowNumber ;
          
          li.append(divNumber,divName,logoDiv); 
          li.style.display="none"; 
          channels.appendChild(li);  
        }  


        var totalChannelCount=Object.keys(channelList).length;
        if(totalChannelCount!=rowNumber)
          totalChannelCount=rowNumber+" / "+totalChannelCount;
        UI.setCategoryInfoHeader(Player.lastSelectedCategory,totalChannelCount);
        UI.next(1);
      },
      next: function(jumpCount) {
        jumpCount=jumpCount||fitContent.row; 
        var channelList = dom.channels;
        if(channelList.children.length<1)
          return;
        if (!selectedChannel) {
          selectedChannel = channelList.firstChild;
        } 
        else {
          selectedChannel.classList.remove('selected');
          for(var i=0;i<jumpCount;i++){
            selectedChannel = selectedChannel.nextSibling;
          if (!selectedChannel){
            selectedChannel = channelList.firstChild;
            var diff=jumpCount-(channelList.children.length%jumpCount);
            i=((i+diff)%jumpCount);
          } 
            
          } 
          selectedChannel.classList.add('selected');
        }  
        if(selectedChannel.dataset.url==null){ 
          this.setCategoryInfoHeader(selectedChannel);
        }
        scrollChannels();
      },
      prev: function(jumpCount) {
        jumpCount=jumpCount||fitContent.row; 
        var channelList = dom.channels;
        if(channelList.children.length<1)
          return;
        if (!selectedChannel) {
          selectedChannel = channelList.firstChild;
          selectedChannel.classList.add('selected');
        }  
        else {
          selectedChannel.classList.remove('selected'); 
          for(var i=0;i<jumpCount;i++){
            selectedChannel = selectedChannel.previousSibling;
            if (!selectedChannel) {
              selectedChannel = channelList.lastChild; 
              var diff=jumpCount-(channelList.children.length%jumpCount);
              i=((i+diff)%jumpCount); 
            }  
            
          }
          selectedChannel.classList.add('selected');   
        } 
        if(selectedChannel.dataset.url==null){
          this.setCategoryInfoHeader(selectedChannel);
        }
        scrollChannels();
      },
      nextDirect: function() {   
        var channelCount = dom.channels.children.length;
        var itemIndex = selectedChannel.firstChild.innerHTML-1; 
        if(fitContent.count+itemIndex<channelCount)
          itemIndex=itemIndex+fitContent.count; 
        UI.setSelectedChannelByPos(itemIndex);    
      },
      prevDirect: function() { 
        var channelCount = dom.channels.children.length;
        var itemIndex = selectedChannel.firstChild.innerHTML-1; 
        if(itemIndex-fitContent.count>0)
          itemIndex=itemIndex-fitContent.count; 
        UI.setSelectedChannelByPos(itemIndex);  
      },
      blurElements:function(){  
        var inputList = document.getElementsByTagName("input");
        var textareaList = document.getElementsByTagName("textarea");
        var buttons = document.getElementsByTagName("button");
        for(var i=0;i<inputList.length;i++) 
          inputList[i].blur();  
        for(var i=0;i<textareaList.length;i++)
          textareaList[i].blur();   
        for(var i=0;i<buttons.length;i++)
          buttons[i].blur();     
      },
      get: function(name) {
        return dom[name];
      },
      get channel() {
        return selectedChannel.dataset;
      },
      getSelectedChannel:function () {
          return selectedChannel;
      },
      setCategoryInfoHeader:function(selectedChannel,count){
        var build = document.querySelector('.build');
        var name=selectedChannel.dataset.name ;
        if(name=="ALL")
          build.innerHTML="&bull;&nbsp;&nbsp;ALL&nbsp;&nbsp;&bull;";
        else  
          build.innerHTML=  name ;
        if(!count){
          var childs=Parser.getCategories()[name].child;
          count=Object.keys(childs).length;  
        }  
        dom.channelCount.innerHTML="[&nbsp;&nbsp;"+count+"&nbsp;&nbsp;]";
      }, 

      setSelectedChannel:function (selected) {
        if(selected.dataset.url==null){
          this.setCategoryInfoHeader(selected );
        } 
        var index=selected.firstChild.innerHTML-1 ;
        this.setSelectedChannelByPos(index);
      },
      setSelectedChannelByPos:function (index) { 
        var channels=dom.channels.children;
        if(selectedChannel)
          selectedChannel.classList.remove('selected');
        selectedChannel=channels[index];
        selectedChannel.classList.add('selected');
        scrollChannels(); 
      },
      refreshScroll:function(){
        scrollChannels(); 
      }
  };
  
}());
