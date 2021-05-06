'use strict';

var Parser = (function() {
  var count=0;;
  var categories = {}; 
  var log=new Logger("parser");
  return {
    get count(){
      return count;
    },
	  getCategories: function(){
		  return categories;
	  },
    clear:function(){ 
      count=0;
      categories = {};
    },  
    
    parseChannels: function(data) {
    	
      var groupTitleString='group-title=';
      var channelNameString='name=';
      var logoString='logo=';
      
      var allGroupTitleName="ALL";
      var lastName;
      var lastLogo;
      var lastGroupTitleName;
      
      data = data.split('\n');
      var log=new Logger("parser"); 
       
      for (var i in data) { 
        var line = data[i].trim();  

        if (line.indexOf('#EXTINF:') != -1) {   
          //var no=line.split(':')[1].split(/\s+/)[0];  
          var groupTitleName="Standart Channel List"; 
          
          if(line.split(groupTitleString)[1]!=undefined){
        	  groupTitleName = line.split(groupTitleString)[1].split('\"')[1].trim() ; 
          }  
          
          var channelName="";
          if(line.split(channelNameString)[1]!=undefined){
        	  channelName = line.split(channelNameString)[1].split('\"')[1].trim() ; 
          }  
          else{
        	  var set = line.split(','); 
        	  channelName = set[1].trim(); 
          } 
          var channelLogo="";
          if(line.split(logoString)[1]!=undefined){
        	  channelLogo = line.split(logoString)[1].split('\"')[1].trim() ; 
          } 


          if(categories[allGroupTitleName]==null)
        	  categories[allGroupTitleName]={name:allGroupTitleName,child:{}}; 
          if(categories[groupTitleName]==null)
        	  categories[groupTitleName]={name:groupTitleName,child:{}};  
          
          lastGroupTitleName=groupTitleName;
          lastName = channelName; 
          lastLogo = channelLogo;
      
        } 
        else if (line.indexOf('http') != -1 && lastName) { 
          categories[groupTitleName].child[line] = { "name": lastName,"url":line, "logo":lastLogo }; 
          categories[allGroupTitleName].child[line] = { "name": lastName,"url":line, "logo":lastLogo };   
          lastGroupTitleName=null;
          lastName = null;
          count++;
           
        }
        
      }
      
    }
  };
}());
