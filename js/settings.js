var Settings=( function(){  
  
  var settingsPanelVisible=false;
  var lockPanelVisible=false;
  var isUnlock=false;
  var passwordStack="";
  var defaultPassword="00000" 
  var isPasswordDefined=false;
  var log = new Logger('Settings');
  var blacklistChannelLinkKeys={};
  var blacklistCategoryKeys={};

 
  return {   
    init:async function (){ 
      log('ready'); 
      UI.message("Getting Ready",60000,true);  
      log('initUI ..');
      initUI();  
      log('initEvents ..');  
      initEvents();
      log('initDB ..');
      initDB();
      log('handleChannelsAsync ..');
      var isThereLink=await handleChannelsAsync();
      document.addEventListener("keydown",App.keyEventListener);
      if(isThereLink)
        initParse(); 
               
      log('fnished'); 
    }, 
    get blacklistCategoryKeys(){
      return blacklistCategoryKeys;
    },
    clearBlacklistCategoryKeys:function(){
      blacklistCategoryKeys={};
    },
    
    get blacklistChannelLinkKeys(){
      return  blacklistChannelLinkKeys;
    }, 
    clearBlacklistChannelLinkKeys:function(){
      blacklistChannelLinkKeys={};
    }, 
      

    hideSettingsPanel:function() {
      settingsPanelVisible=false;
      var settingsPanel=document.getElementById("settings-panel");
      settingsPanel.style.visibility="hidden";
        
    }, 
    showSettingsPanel:function(){
      if(isUnlock||!isPasswordDefined){
        var settingsPanel=document.getElementById("settings-panel");
        settingsPanelVisible=true;
        settingsPanel.style.visibility="visible"; 
      }
      else
        Settings.settingsMessage("There is no permission ! You can try again after unlocking system"  ,5000);  
    }, 
    toggleVisibleSettingsPanel:function(){  
      if(settingsPanelVisible)
        this.hideSettingsPanel();
      else
        this.showSettingsPanel(); 
    }, 
    isSettingsPanelVisible:function(){
      return settingsPanelVisible;
    },


    hideLockPanel:function() {
      lockPanelVisible=false;
      var lockPanel=document.getElementById("lock-panel");
      UI.hide(lockPanel);    
    }, 
    showLockPanel:async function(){ 
      if(Settings.isSettingsPanelVisible())
        return;   
      var psw= await DB.getPasswordAsync();
      if(psw==defaultPassword){
        Settings.settingsMessage("There is no defined password ! You can set password from 'Settings'",5000 );  
        return;
      }  
      var lockPanel=document.getElementById("lock-panel");
      var password=document.getElementById("password");
      password.innerHTML="";
      passwordStack="";
      lockPanelVisible=true;
      UI.show(lockPanel);    
    },  
    toggleVisibleLockPanel:function(){ 
      if(Player.isFullscreen)
        return; 
      if(isUnlock){
        isUnlock=false;
        this.settingsMessage("<div style='color:green;'>Locked !</div>");  
        document.getElementById("lock").classList.remove("unlock"); 
      } 
      else if(lockPanelVisible)
        this.hideLockPanel();
      else
        this.showLockPanel(); 
    }, 
    isLockPanelVisible:function(){
      return lockPanelVisible;
    },
    numberKey:async function(key){  
      var psw= await DB.getPasswordAsync();
      var passwordInput=document.getElementById("password"); 
      passwordStack=passwordStack+key; 
      if(passwordStack.length==5){   
        if(psw==passwordStack){
          isUnlock=true;
          Settings.hideLockPanel(); 
          Settings.settingsMessage("<div style='color:green;'>Unlocked !</div>",5000 );  
          document.getElementById("lock").classList.add("unlock"); 
        }
        else
          passwordInput.style.color="red";  
      } 
      if(passwordStack.length>5){ 
        passwordInput.style.color="#c09000";
        passwordStack="";
      }    
      passwordInput.innerHTML="*".repeat(passwordStack.length);
	  },

    addSelectedCategoryOrChannelToBlacklist:async function(){ 
      if(Player.isFullscreen)
        return;
      var item=UI.getSelectedChannel();
      var list=UI.get("channels");
      if(Settings.isSettingsPanelVisible() || item==null || list.children.length==0)
        return; 
      if(isUnlock || !isPasswordDefined){ 
        let name=item.dataset.name.trim();
        let url=item.dataset.url;
        if(name=="ALL")
        {
          this.settingsMessage("You can't add 'ALL' to blacklist !",5000);
          return;
        }
        if(url==null){ 
          DB.addBlacklistCategoryAsync(name+"\n");
          Settings.blacklistCategoryKeys[name]=true; 
          var channels=Parser.getCategories()[name].child 
          for(var channel in channels){
            Settings.blacklistChannelLinkKeys[channel]=true;
          } 
          var blacklistCategoryTable=document.getElementById("blacklist-category-table");
          var tr=createBlacklistCategoryRow(blacklistCategoryTable,name );  
          blacklistCategoryTable.prepend(tr);  
          updateTableRowsNumber(blacklistCategoryTable); 
          var firstBC=document.getElementById("first-blacklist-category");
          firstBC.click();  
        }  
        else{
          url=url.trim();
          if(url==""){
            this.settingsMessage("There is no link of the channel ! '"+url+"' ",5000);
            return;
          } 
          DB.addBlacklistChannelAsync(name+"\n"+url+"\n"); 
          Settings.blacklistChannelLinkKeys[url]=true;
          var blacklistChannelTable=document.getElementById("blacklist-channel-table");
          var tr=createBlacklistChannelRow(blacklistChannelTable,name,url );  
          blacklistChannelTable.prepend(tr);  
          updateTableRowsNumber(blacklistChannelTable); 
          var firstBC=document.getElementById("first-blacklist-channel");
          firstBC.click();
        }   
       
        this.settingsMessage("'&nbsp;&nbsp;"+name+"&nbsp;&nbsp;'<div style='color:green;'>"+"&nbsp;&nbsp;Added to blacklist !"+"</div>");
        if(item) 
          list.removeChild(item);
        if(list.children.length==0) 
          return; 
        var number=item.firstChild.innerHTML; 
        updateCategoryOrChannelListNumber(list);  
        if(number > list.children.length){
          UI.setSelectedChannelByPos(list.children.length-1); 
        }  
        else  {
          UI.setSelectedChannelByPos(number-1); 
        } 
      }
      else{
        this.settingsMessage("There is no permission ! You can try again after unlocking system"  ,5000);  
      } 
    },

    search:function(){
      var searchInput=document.getElementById("search-input"); 
      var text=searchInput.value.trim(); 
      var keywords=text.split(/\s+/);
      if(text.length==0)
        return;
      Settings.settingsMessage("Searching",60000,true); //"' "+text+" '"+  
      setTimeout(function(){ 
        var searchResults={}; 
        var categories=Parser.getCategories();
        for(var i=0;i<keywords.length;i++){
          var keyword=keywords[i].toLowerCase();
          for(var category in categories){
            var channels=categories[category].child;
            for(var channel in channels){
              var name=channels[channel].name.toLowerCase();
              if(name.includes(keyword)){
                searchResults[channel]=channels[channel];  
              } 
            } 
          }
        }
        var resultCount=Object.keys(searchResults).length;
        if(resultCount!==0){
          if(!Player.lastSelectedCategory)
            Player.lastSelectedCategory=UI.getSelectedChannel();
          var lastName=Player.lastSelectedCategory.dataset.name;  
          Player.lastSelectedCategory.dataset.name="&bull;&nbsp;&nbsp;Searching&nbsp;Results&nbsp;&nbsp;&bull;" 
          UI.setChannels(searchResults);  
          Player.lastSelectedCategory.dataset.name=lastName; 
          var message=Settings.settingsMessage(resultCount+"&nbsp;results found !"); 
          message.style.color='green';  
        }
        else
          Settings.settingsMessage("Not Found !")
      },1000);
      
    },

    settingsMessage:function(msg,time,dotAnimation){
      time=time||3000;
      dotAnimation=dotAnimation||false;
      var message=UI.message(msg,time,dotAnimation,1); 
      message.style.color="white"; 
      return message;
    },
      
    
  } 
  // ******************** RETRUN END ***********************************
  async function initDB(){
    var psw=await DB.getPasswordAsync();
    if(psw!=defaultPassword) {
      isPasswordDefined=true;
      document.getElementById("lock").classList.remove("unlock");   
    }  
  }

  function initUI(){
    tablinks = document.getElementsByClassName("tablink");
    var pageName=["home","user-control","blacklist-category","blacklist-channel"];
    var linksBackground="transparent";   
    
    tablinks[0].onclick= function(){
      openPage(pageName[0],this,linksBackground); 
    }
    tablinks[1].onclick= function(){
      openPage(pageName[1],this,linksBackground); 
    }
    tablinks[2].onclick= function(){ 
      openPage(pageName[2],this,linksBackground); 
      scrollBlacklist("category","first"); 
    }
    tablinks[3].onclick= function(){ 
      openPage(pageName[3],this,linksBackground); 
      scrollBlacklist("channel","first");
    }  
    tablinks[0].click();
  }

  function initEvents (){

    var generalSettings=document.getElementById("general-settings"); 
    var lock=document.getElementById("lock"); 
    var refresh=document.getElementById("refresh"); 
    var search=document.getElementById("search");  

    var saveLinks=document.getElementById("save-links"); 
    var resetLinks=document.getElementById("reset-links"); 
    var clearLinks=document.getElementById("clear-links"); 
    var messageLinks=document.getElementById("message-links");
     
    var currentPsw=document.getElementById("current-psw"); 
    var newPsw=document.getElementById("new-psw"); 
    var confirmPsw=document.getElementById("confirm-psw"); 
    var messagePsw=document.getElementById("message-psw"); 
    var savePsw=document.getElementById("save-psw"); 
    var clearPsw=document.getElementById("clear-psw");

    var blacklistCategoryTable=document.getElementById("blacklist-category-table");
    var blacklistChannelTable=document.getElementById("blacklist-channel-table");  
    var linksTable=document.getElementById("links-table");  
   

    var nextBlacklistCategory=document.getElementById("next-blacklist-category");
    var backBlacklistCategory=document.getElementById("back-blacklist-category");
    var firstBlacklistCategory=document.getElementById("first-blacklist-category");
    var endBlacklistCategory=document.getElementById("end-blacklist-category");
    var ratioBlacklistCategory=document.getElementById("ratio-blacklist-category");

    var saveBlacklistCategory=document.getElementById("save-blacklist-category");
    var resetBlacklistCategory=document.getElementById("reset-blacklist-category");
    var clearBlacklistCategory=document.getElementById("clear-blacklist-category");
    var addBlacklistCategory=document.getElementById("add-blacklist-category"); 
    var messageBlacklistCategory=document.getElementById("message-blacklist-category"); 

    var nextBlacklistChannel=document.getElementById("next-blacklist-channel");
    var backBlacklistChannel=document.getElementById("back-blacklist-channel");
    var firstBlacklistChannel=document.getElementById("first-blacklist-channel");
    var endBlacklistChannel=document.getElementById("end-blacklist-channel");
    var ratioBlacklistChannel=document.getElementById("ratio-blacklist-channel"); 

    var saveBlacklistChannel=document.getElementById("save-blacklist-channel");
    var resetBlacklistChannel=document.getElementById("reset-blacklist-channel");
    var clearBlacklistChannel=document.getElementById("clear-blacklist-channel");
    var addBlacklistChannel=document.getElementById("add-blacklist-channel"); 
    var messageBlacklistChannel=document.getElementById("message-blacklist-channel");
    

    generalSettings.onclick=function(){
      Settings.showSettingsPanel(); 
    };
    generalSettings.onmouseenter=function(){
      generalSettings.style.transform="scale(1.1)";  
      generalSettings.style.opacity=1;
    };
    generalSettings.onmouseleave=function(){
      generalSettings.style.transform="scale(1.0)"; 
      generalSettings.style.opacity=0.8;
    } 

    refresh.onclick=async function(){ 
      var message=Settings.settingsMessage("Refreshing",60000,true); 
      await handleChannelsAsync(); 
      var selectedChannel=UI.getSelectedChannel(); 
        if(Player.lastSelectedCategory==null){ 
          UI.setCategories(Parser.getCategories());
          UI.setSelectedChannel(selectedChannel);   
        }
        else{  
          UI.setChannels(Parser.getCategories()[Player.lastSelectedCategory.dataset.name].child,function(){
            if(selectedChannel)
              UI.setSelectedChannel(selectedChannel);  
          });  
        }
        message=Settings.settingsMessage("Refreshed !"); 
        message.style.color='green';
    };
    refresh.onmouseenter=function(){
      refresh.style.transform="scale(1.1)";  
      refresh.style.opacity=1;
    };
    refresh.onmouseleave=function(){
      refresh.style.transform="scale(1.0)"; 
      refresh.style.opacity=0.8;
    } 
    
    lock.onclick=function(){
      if(isUnlock){
        isUnlock=false;
        Settings.settingsMessage("<div style='color:green;'>Locked !</div>"); 
        document.getElementById("lock").classList.remove("unlock"); 
      } 
      else if(!Settings.isLockPanelVisible())
        Settings.showLockPanel(); 
    };
    lock.onmouseenter=function(){
      lock.style.transform="scale(1.1)"; 
      lock.style.opacity=1;
    };
    lock.onmouseleave=function(){
      lock.style.transform="scale(1.0)";
      lock.style.opacity=0.8;
    } 

    search.onclick=function(){
      UI.toggleSearchPanel();  
    }; 
    search.onmouseenter=function(){
      search.style.transform="scale(1.1)"; 
      search.style.opacity=1;
    };
    search.onmouseleave=function(){
      search.style.transform="scale(1.0)"
      search.style.opacity=0.8;
    } 


    saveLinks.onclick=function(){ 
      var links=linksTable.getElementsByTagName("Input");
      var linkBuff=""; 
      
      for(var i=0;i<links.length;i++){  
        var link=links[i].value.trim(); 
        if(link=="")
          continue;
        linkBuff+=link+"\n"; 
      }

      DB.setChannelLinkAsync(linkBuff);
      sendMsgStyleGreen(messageLinks,"All records was saved successfully !");  
      
    }; 
    resetLinks.onclick=async function(){  
      var linksDB=await DB.getChannelLinkAsync();
      var links=linksTable.getElementsByTagName("Input");
      for(var i=0;i< links.length;i++){  
        links[i].value="";
      }  
      var linksDB=linksDB.split("\n"); 
      for(var i=0;i<linksDB.length-1;i++){  
        links[i].value=linksDB[i];
      }
      sendMsgStyleGreen(messageLinks,"All records was reset successfully !");  
    };  
    resetLinks.click();   
    sendMsgStyleGreen(messageLinks,""); 
    

    savePsw.onclick=async function(){  
      var psw=await DB.getPasswordAsync();
      if(currentPsw.value!=psw){
        sendMsgStyleRed(messagePsw,"Current Password is not valid !");  
        return;
      }
      if(newPsw.value.length<5||confirmPsw.value.length<5){
        sendMsgStyleRed(messagePsw,"New Password's and Confirm Password's length can be 5 !"); 
        return;
      }  
      if(newPsw.value!=confirmPsw.value){
        sendMsgStyleRed(messagePsw,"New Password is not equal to Confirm Password !"); 
        return;
      }
      DB.setPasswordAsync(newPsw.value);
      isUnlock=false;
      isPasswordDefined=true;
      document.getElementById("lock").classList.remove("unlock"); 
      if(newPsw.value==defaultPassword){  
        isPasswordDefined=false;
        sendMsgStyleGreen(messagePsw,"Password is removed ! You can enter everywhere anymore without password");    
        document.getElementById("lock").classList.add("unlock"); 
      }
      else 
        sendMsgStyleGreen(messagePsw,"Password is changed successfuly !"); 
      clearPsw.click();   
      
    }; 

    
    nextBlacklistCategory.onclick=function(){
      scrollBlacklist("category","next");
    };
    backBlacklistCategory.onclick=function(){
      scrollBlacklist("category","back");
    };
    endBlacklistCategory.onclick=function(){
      scrollBlacklist("category","end");
    };
    firstBlacklistCategory.onclick=function(){
      scrollBlacklist("category","first");
    };  

    
    nextBlacklistChannel.onclick=function(){
      scrollBlacklist("channel","next");
    };
    backBlacklistChannel.onclick=function(){
      scrollBlacklist("channel","back");
    };
    endBlacklistChannel.onclick=function(){
      scrollBlacklist("channel","end");
    };
    firstBlacklistChannel.onclick=function(){ 
      scrollBlacklist("channel","first");
    }; 


    saveBlacklistCategory.onclick=function(){ 
      var buffer=""; 
      var rows=blacklistCategoryTable.rows;
      for(var i=rows.length-1;i>=0;i--){  
          var tr=rows[i]; 
          var name=tr.getElementsByTagName("input")[0].value.trim();
          if(name=="")
            continue;
            buffer+=name+"\n";   
      }  
      DB.setBlacklistCategoryAsync(buffer);
      firstBlacklistCategory.click(); 
      sendMsgStyleGreen(messageBlacklistCategory,"All records was 'permanently' saved successfully !"); 
    }; 
    resetBlacklistCategory.onclick=async function(){
      var categories=await DB.getBlacklistCategoryAsync(); 
      try {
        deleteAllRowsFromTable(blacklistCategoryTable); 
        categories=categories.split("\n"); 
        for(var i=0;i< categories.length-1;i++){   
          var tr=createBlacklistCategoryRow(blacklistCategoryTable,categories[i] );  
          blacklistCategoryTable.prepend(tr); 
        }     
        updateTableRowsNumber(blacklistCategoryTable); 
        firstBlacklistCategory.click(); 
        sendMsgStyleGreen(messageBlacklistCategory,"All records was reverted !");
      } catch (error) {
        console.log("code 532 :"+error);
      } 
    }; 
    clearBlacklistCategory.onclick=function(){
      deleteAllRowsFromTable(blacklistCategoryTable); 
      firstBlacklistCategory.click();
      sendMsgStyleGreen(messageBlacklistCategory,"All records was cleared. If you want Changes to be 'permanent' please click 'Save' button ..!");
    }; 
    addBlacklistCategory.onclick=function(){
      var tr=createBlacklistCategoryRow(blacklistCategoryTable,"");
      blacklistCategoryTable.prepend(tr);
      updateTableRowsNumber(blacklistCategoryTable); 
      firstBlacklistCategory.click();
      sendMsgStyleGreen(messageBlacklistCategory,"New records was added ! If you want Changes to be 'permanent' please click 'Save' button ..!");
    }; 
    resetBlacklistCategory.click();
   
    
    

    saveBlacklistChannel.onclick=function(){ 
      var buffer="" ; 
      var rows=blacklistChannelTable.rows;
      for(var i=rows.length-1;i>=0;i--){  
          var tr=rows[i]; 
          var name=tr.getElementsByTagName("input")[0].value.trim(); 
          var url=tr.getElementsByTagName("input")[1].value.trim();   
          //console.log("SAVE -> id : " +id+"name : "+name+"  url : "+url);
          if(name==""||url=="")
            continue;  
          buffer+=name+"\n"+url+"\n";   
      } 
      DB.setBlacklistChannelAsync(buffer);
      firstBlacklistChannel.click(); 
      sendMsgStyleGreen(messageBlacklistChannel,"All records was 'permanently' saved successfully !"); 
    };

    resetBlacklistChannel.onclick=async function(){
      var channels=await DB.getBlacklistChannelAsync();
      deleteAllRowsFromTable(blacklistChannelTable); 
      channels=channels.split("\n");
      for(var i=0;i<channels.length-1;i=i+2){  
        var tr=createBlacklistChannelRow(blacklistChannelTable,channels[i],channels[i+1] );  
        blacklistChannelTable.prepend(tr); 
      }     
      updateTableRowsNumber(blacklistChannelTable);  
      firstBlacklistChannel.click(); 
      sendMsgStyleGreen(messageBlacklistChannel,"All records was reverted !");  
    }; 
    clearBlacklistChannel.onclick=function(){
      deleteAllRowsFromTable(blacklistChannelTable); 
      firstBlacklistChannel.click();
      sendMsgStyleGreen(messageBlacklistChannel,"All records was cleared. If you want Changes to be 'permanent' please click 'Save' button ..!");
    }; 
    addBlacklistChannel.onclick=function(){
      var tr=createBlacklistChannelRow(blacklistChannelTable,"","");
      blacklistChannelTable.prepend(tr);
      updateTableRowsNumber(blacklistChannelTable); 
      firstBlacklistChannel.click(); 
      sendMsgStyleGreen(messageBlacklistChannel,"New records was added ! If you want Changes to be 'permanent' please click 'Save' button ..!");
    }; 
    resetBlacklistChannel.click(); 
       
  }

  
  function sendMsgStyleGreen(element,msg){
    element.style.color="green";
    element.innerHTML=msg;
    setTimeout(function(){
      element.innerHTML="";
    },5000); 
  } 

  function sendMsgStyleRed(element,msg){ 
    element.style.color="red";
    element.innerHTML=msg;
    setTimeout(function(){
      element.innerHTML="";
    },5000); 
  }
 
  function updateTableRowsNumber(table){
    for(var i=0;i<table.rows.length;i++){ 
      table.rows[i].children[0].innerHTML=i+1;
    } 
  }

  function updateCategoryOrChannelListNumber(list){ 
    for(var i=0;i<list.children.length;i++){  
      list.children[i].firstChild.innerHTML=i+1;
    } 
  }

  function addClickEventToDeleteInput(deletInput,table,ratio){ //bozuk scroll sayısı update etmiyor
    deletInput.onclick=function(){
      var tr=this.parentNode.parentNode;
      deleteRowsFromTable(table,tr); 
      updateTableRowsNumber(table); 
      var ratioParse=ratio.innerHTML.split("/"); 
      ratioParse[1]=ratioParse[1]-1; 
      if(ratioParse[1]<ratioParse[0])
        ratioParse[0]=ratioParse[0]-1; 
      ratio.innerHTML=ratioParse[0]+" / "+ratioParse[1];  
    }; 
  } 
 
  function createBlacklistCategoryRow(table,name){
    var tr=document.createElement('tr');
    var td1=document.createElement('td');
    var td2=document.createElement('td');
    var td3=document.createElement('td'); 

    var nameInput=document.createElement('input');
    var deletInput=document.createElement('input'); 


    td1.classList.add("blacklist-category-number-td");
    td2.classList.add("blacklist-category-name-td");
    td3.classList.add("blacklist-category-delete-td");
 
    name=name||"";  
    nameInput.value=name;  

    deletInput.type="button";
    deletInput.value="Delete";
    deletInput.classList.add("clear-input");

    var ratio=document.getElementById("ratio-blacklist-category");
    addClickEventToDeleteInput(deletInput,table,ratio); 

    td2.appendChild(nameInput);
    td3.appendChild(deletInput);
    
    tr.append(td1,td2,td3); 
    return tr;
  }

  function createBlacklistChannelRow(table,name,url ){
    var tr=document.createElement('tr');
    var td1=document.createElement('td');
    var td2=document.createElement('td');
    var td3=document.createElement('td');
    var td4=document.createElement('td');  

    var nameInput=document.createElement('input');
    var urlInput=document.createElement('input');
    var deletInput=document.createElement('input');

    td1.classList.add("blacklist-channel-number-td");
    td2.classList.add("blacklist-channel-name-td");
    td3.classList.add("blacklist-channel-url-td");
    td4.classList.add("blacklist-channel-delete-td");
     
    name=name||"";  
    url=url||"";  

    nameInput.value=name; 
    urlInput.value=url;

    deletInput.type="button";
    deletInput.value="Delete";
    deletInput.classList.add("clear-input");
    
    var ratio=document.getElementById("ratio-blacklist-channel");
    addClickEventToDeleteInput(deletInput,table,ratio); 

    td2.appendChild(nameInput);
    td3.appendChild(urlInput);
    td4.appendChild(deletInput);
    
    tr.append(td1,td2,td3,td4);  
    return tr;
  }

  function deleteRowsFromTable(table,row){
    table.deleteRow(row.rowIndex);
  }

  function deleteAllRowsFromTable(table){ 
    table.innerHTML = "";
  }

  function openPage(pageName,elmnt,color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    var elmntIndex;
    for (i = 0; i < tablinks.length; i++) { 
      if(tablinks[i]==elmnt)
        elmntIndex=i;

      tablinks[i].style.backgroundColor = ""; 
      tablinks[i].style.borderTop= "";
      
      if(i!=0)
        tablinks[i].style.borderLeft = "thin solid rgb(34, 47, 61)";
      if(i!=tabcontent.length-1)
        tablinks[i].style.borderRight = "thin solid rgb(34, 47, 61)";
      tablinks[i].style.borderBottom = "thin solid white";  
    }
    elmnt.style.borderBottom = "";
    elmnt.style.borderTop = "thin solid white";
    if(elmntIndex!=0)
      elmnt.style.borderLeft = "thin solid white";
    if(elmntIndex!=tabcontent.length-1)
      elmnt.style.borderRight = "thin solid white"; 
    elmnt.style.backgroundColor = color; 
    document.getElementById(pageName).style.display = "block";
    
  } 


  function scrollBlacklist(type,cmd) {  
    if(type=="category"){
      var table = document.getElementById("blacklist-category-table");
      var sidebar = document.getElementById("blacklist-category-sidebar"); 
      var ratio=document.getElementById("ratio-blacklist-category");
    }
    
    else if(type=="channel"){ 
      var table  = document.getElementById("blacklist-channel-table");
      var sidebar  = document.getElementById("blacklist-channel-sidebar");
      var ratio=document.getElementById("ratio-blacklist-channel");
    }   
    
    if(table.rows.length==0){
      ratio.innerHTML=0+" / "+0;
      return;
    }
    

    var allItemCount= table.rows.length;
    var tableBorderSpacing=parseInt(table.style.borderSpacing.split(" ")[0]);
    var itemHeight = table.rows[0].offsetHeight+tableBorderSpacing;
    var listHeight = sidebar.offsetHeight;
    var itemCount = parseInt (listHeight / itemHeight)  ;
    //console.log("itemCount : "+itemCount+" table.rows.length :"+table.rows.length+" listHeight : "+listHeight+" itemHeight : "+itemHeight);
    if(table.rows.length<itemCount){
      ratio.innerHTML=table.rows.length+" / "+table.rows.length;
      return;
    }
    
    if(cmd=="next")
      sidebar.scrollTop =sidebar.scrollTop+(itemCount*itemHeight);  
    else if(cmd=="back")
      sidebar.scrollTop =sidebar.scrollTop-(itemCount*itemHeight); 
    else if(cmd=="end")
      sidebar.scrollTop =allItemCount*itemHeight; 
    else if(cmd=="first"){ 
      sidebar.scrollTop=0;
    } 
    
    var currentIndex= sidebar.scrollTop/itemHeight  ;
    var overflow= sidebar.scrollTop%itemHeight  ;  
    //console.log(overflow);
    
    if(overflow!=0){
      if(cmd=="next")
        currentIndex=allItemCount;
      else if(cmd=="back")
        currentIndex=itemCount+parseInt(currentIndex)+1; 

    }
    else{ 
      currentIndex+=itemCount;
    } 
    if(cmd=="end")
      currentIndex=allItemCount;
    else if(cmd=="first"){
      currentIndex=itemCount;
    }  
    
    ratio.innerHTML=currentIndex+" / "+allItemCount;
  }

  async function handleChannelsAsync(){  
    var links=await DB.getChannelLinkAsync();

    Settings.clearBlacklistCategoryKeys(); 
    Settings.clearBlacklistChannelLinkKeys();
    Parser.clear();  
    var links=links.split("\n"); 
    for(var i=0;i<links.length-1;i++){  
      link=links[i];
      var result=""; 
      try { 
        if(link.startsWith("http://")||link.startsWith("https://"))
          result=await req(link);  
        else  
          result=reqFile(link); 
      } catch (error) {
        var message=UI.message("<div><div >'&nbsp;&nbsp;"+link+"&nbsp;&nbsp;'</div><div style='color:green;margin-top:0.5em;'>"+"wasn't open ! Please check link"+"</div></div>",10000,false,i+10);
        message.style.backgroundColor="rgba(1, 26, 49,0.9)";
        log('Error loading playlist:'+link); 
      } 
      Parser.parseChannels(result);    
    }

    var categories=await DB.getBlacklistCategoryAsync();

    categories=categories.split("\n");  
    for(var i=0;i<categories.length-1;i++){ 
      Settings.blacklistCategoryKeys[categories[i]]=true;
      var category=Parser.getCategories()[categories[i]];
      if(category){
        channels=category.child;
        for(var channel in channels){
          Settings.blacklistChannelLinkKeys[channels[channel].url]=true;
        }
      } 
    }

    var channels=await DB.getBlacklistChannelAsync();

    channels=channels.split("\n"); 
    for(var i=0;i<channels.length-1;i=i+2){ 
      Settings.blacklistChannelLinkKeys[channels[i+1]]=true;
    }  

    if(links.length>1){   
      return true;
    }
    else{
      UI.message("There is no defined link. You can add links from 'Settings'",10000,false,20);
      return false;
    }  
     
  }

  async function req(link){
    var response=await fetch(link); 
    var result=await response.text();
    return result;
  }
  
  function reqFile(link)
  { 
    var response=""; 
    var xhr = new XMLHttpRequest();
    xhr.open('GET', link, false);  
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.responseText!=""&&(xhr.status == 0 || xhr.status == 200)) { 
          response=xhr.responseText;
        } else {  
          var message=UI.message("<div><div >'&nbsp;&nbsp;"+link+"&nbsp;&nbsp;'</div><div style='color:green;margin-top:0.5em;'>"+"wasn't open ! Please check link"+"</div></div>",10000,false,i+10);
          message.style.backgroundColor="rgba(1, 26, 49,0.9)";
          log('Error request playlist link :'+link, xhr.status);
        }
      }
    }; 
    xhr.send(null);
    return response;  
  }

  function initParse(){ 
    UI.setCategories(Parser.getCategories());
    Player.next(1);
    Player.init(App.resolution); 
    UI.message();  
  }

}());


