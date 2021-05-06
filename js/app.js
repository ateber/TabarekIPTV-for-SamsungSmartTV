'use strict';

var App = (function() {

  // Globals
  var log, tv;  
  var ChannelsfilePath='data/playlist.m3u8'; 
  
  // Remote control keys
  var usedKeys = [
    'Info',
    'MediaPause', 'MediaPlay',
    'MediaPlayPause', 'MediaStop',
    'MediaFastForward', 'MediaRewind',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'ChannelUp','ChannelDown',
    'ColorF0Red','ColorF1Green','ColorF2Yellow','ColorF3Blue','Source'
  ];

  // Register keys
  usedKeys.forEach(function(key) {
    tizen.tvinputdevice.registerKey(key);
  }); 
  // Key events
  

  
  // On DOM loaded
  function onLoad() {
     
    // Set app logger
    log = new Logger('app');
    log('DOM loaded');

    // Get build
    tizen.systeminfo.getPropertyValue('BUILD', function(data) {
      log(
        'BUILD:', data.buildVersion,
        'MODEL:', data.model, '(' + data.manufacturer + ')'
      ); 
    }); 
    
    // Set UI
    UI.init(); 

    // Set Settings
    DB.createFiles(function(){  
      Settings.init(); 
    });  

    tizen.systeminfo.getPropertyValue('DISPLAY', function(data) {
      tv = {
        width: data.resolutionWidth,
        height: data.resolutionHeight
      };   
    }); 

    
    
  }  

  // Events
  document.addEventListener('DOMContentLoaded', onLoad);

  
  // Return App API
  return {    
    get resolution(){
      return  tv;
    },
    get keyEventListener(){ 
      return function(e) { 
         
          var key = e.keyCode;
          switch (key) {
            case 65376: // Done
              UI.blurElements();
              if(UI.isSearchPanelVisible){ 
                Settings.search();
                UI.toggleSearchPanel(); 
              }   
              break;
            case 65385: // Cancel
              UI.blurElements();
              if(UI.isSearchPanelVisible)
                UI.toggleSearchPanel();
              break;
            case 10252: // MediaPlayPause
            case 13: // Enter
              log('key: enter');
              if(Cursor.isCursorVisible())
                Cursor.click();
              else
                Player.enter();
              break;
            case 415: // MediaPlay
              log('key: play/pause');
              Player.playPause();
              break;
            case 19: // MediaPause
              log('key: pause');
              Player.pause();
              break;
            case 413: // MediaStop
              log('key: stop');
              Player.stop();
              break;
            case 39: // ArrowRight
              log('key: ArrowRight');
              if(UI.isExitPanelVisible)
                return;  
              if(Cursor.isCursorVisible())  
                Cursor.move("right"); 
              else if(Player.isFullscreen)
               Player.foward()
              else  
                UI.next(1);  
              break;
            case 37: // ArrowLeft
              log('key: ArrowLeft');
              if(UI.isExitPanelVisible)
                return;  
              if(Cursor.isCursorVisible())
                Cursor.move("left");
              else if(Player.isFullscreen)
                Player.rewind();
              else    
                UI.prev(1);
              break;
            case 417: // MediaFastForward
              log('key: MediaFastForward');
              if(UI.isExitPanelVisible)
                return;    
              Player.mediaFoward();
              break;
            case 412: // MediaRewind
              if(UI.isExitPanelVisible)
                return;  
              log('key: MediaRewind');   
              Player.mediaRewind();
              break;  
            case 38: // Up
              //log('key: up');
              if(UI.isExitPanelVisible){
                UI.selectExitChoice(true);
              }
              else if(Cursor.isCursorVisible())
                Cursor.move("up");
              else if(Player.isFullscreen) 
                if(Player.isMinScreen)  
                  Player.prev(1);
                else{
                  Player.toggleMinScreen(); 
                  UI.refreshScroll();
                }   
              else 
                Player.prev(); 
              break;
            case 40: // Down
              //log('key: down');
              if(UI.isExitPanelVisible){
                UI.selectExitChoice(false);
              }
              else if(Cursor.isCursorVisible())
                Cursor.move("down");
              else if(Player.isFullscreen)
                if(Player.isMinScreen)  
                  Player.next(1);
                else{
                  Player.toggleMinScreen();
                  UI.refreshScroll();
                }   
              else 
                Player.next(); 
              break; 
            case 10009: // Back
              log('key: back'); 
              if(Settings.isLockPanelVisible())
                Settings.hideLockPanel(); 
              else if(Settings.isSettingsPanelVisible()) 
                Settings.hideSettingsPanel();  
              else
                Player.back();
              break;
            case 427: // ChannelUp
              log('key: ChannelUp');
              if(UI.isExitPanelVisible)
                return;   
              Player.channelUp();
              break;
            case 428: // ChannelDown
              log('key: ChannelDown'); 
              if(UI.isExitPanelVisible)
                return;   
              Player.channelDown();
              break;	
            case 457: // Info
              if(UI.isSearchPanelVisible)
                return;
              if(UI.isExitPanelVisible)
                return;  
              Player.showBottomChannelInfo();  
              //Player.nextAudio();
              break;
            case 403: // Red 
              if(UI.isSearchPanelVisible)
                return;  
              if(UI.isExitPanelVisible)
                return;  
              Settings.addSelectedCategoryOrChannelToBlacklist();
              break;
            case 404: // Green  
              if(UI.isSearchPanelVisible)
                return
              if(UI.isExitPanelVisible)
                return;  
              Settings.toggleVisibleLockPanel();
              break;
            case 405: // Yellow 
              if(UI.isSearchPanelVisible)
                return;
              if(UI.isExitPanelVisible)
                return;  
              Cursor.toggleVisibleCursor();
              break;
            case 406: // Blue 
              if(UI.isSearchPanelVisible)
                return;
              if(UI.isExitPanelVisible)
                return;  
              Settings.toggleVisibleSettingsPanel(); 
              break;
            case 10072: // Soruce 
              //Player.toggleSet4K();  
              UI.get('log').classList.toggle('hide');
              break;  
            case 48: // Key 0
              if(Settings.isLockPanelVisible())
                Settings.numberKey(0);
              else 
                Player.numberKey(0);
              break; 
            case 49: // Key 1
              if(Settings.isLockPanelVisible())
                Settings.numberKey(1);
              else  
                Player.numberKey(1);
              break; 
            case 50: // Key 2
              if(Settings.isLockPanelVisible())
                Settings.numberKey(2);
              else 
                Player.numberKey(2);
              break;
                //Player.set4k(false)
                //break;
            case 51: // Key 3 
              if(Settings.isLockPanelVisible())
                Settings.numberKey(3);
              else 
                Player.numberKey(3);
              break;
            case 52: // Key 4
              if(Settings.isLockPanelVisible())
                Settings.numberKey(4);
              else 
                Player.numberKey(4);
              break;
            case 53: // Key 5
              if(Settings.isLockPanelVisible())
                Settings.numberKey(5);
              else 
                Player.numberKey(5);
              break;
            case 54: // Key 6
              if(Settings.isLockPanelVisible())
                Settings.numberKey(6);
              else 
                Player.numberKey(6);
              break;
            case 55: // Key 7
              if(Settings.isLockPanelVisible())
                Settings.numberKey(7);
              else 
                Player.numberKey(7);
              break;
            case 56: // Key 8
              if(Settings.isLockPanelVisible())
                Settings.numberKey(8);
              else 
                Player.numberKey(8);
              break;
            case 57: // Key 9
              if(Settings.isLockPanelVisible())
                Settings.numberKey(9);
              else 
                Player.numberKey(9);
              break; 
            // default:
            log('key:', key);
            break;
         
        }
        
      }; 
    } 

  };

}()); 

 