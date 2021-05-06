var DB=(function(){
    var dataDirectory="TabarekTV";
    var log = new Logger('DB');
    var dir; 
    return{
        createFiles:function (callback){
            tizen.filesystem.resolve("documents",function(directory) {
                var password,channelDataLinks,blacklistCategories,blacklistChannels;
                try{
                    dir = directory.createDirectory(dataDirectory); 
                }catch(error){
                    try {
                        dir=directory.resolve(dataDirectory);
                    } catch (error2) {
                        log("code 1 : "+error+" -- 2: "+error2);
                    } 
                }  
                try { 
                    password = dir.createFile("password"); 
                    DB.setAsync("password","00000");
                } catch (error) {log("code 2 : "+error);}

                try {
                    channelDataLinks = dir.createFile("channelDataLinks");
                } catch (error) {log("code 3 : "+error);}

                try {
                    blacklistCategories= dir.createFile("blacklistCategories");
                } catch (error) {log("code 4 : "+error);}

                try { 
                    blacklistChannels= dir.createFile("blacklistChannels");
                } catch (error) {log("code 5 : "+error);} 
                
                if(callback)
                    callback();
                    
            },function(error){log("code : 8"+error)});  
        },  
        
        

        
        setChannelLink:function (data,callback){ 
            this.set("channelDataLinks",data,callback);
        },
        addChannelLink:function (data,callback){ 
            this.add("channelDataLinks",data,callback);
        },
        getChannelLink:function(callback){
            this.get("channelDataLinks",callback);
        },

        setPassword:function (data,callback){ 
            this.set("password",data,callback);
        },
        addPassword:function (data,callback){ 
            this.add("password",data,callback);
        },
        getPassword:function(callback){
            this.get("password",callback);
        },

        setBlacklistCategory:function (data,callback){ 
            this.set("blacklistCategories",data,callback);
        },
        addBlacklistCategory:function (data,callback){ 
            this.add("blacklistCategories",data,callback);
        },
        getBlacklistCategory:function(callback){
            this.get("blacklistCategories",callback);
        },

        setBlacklistChannel:function (data,callback){ 
            this.set("blacklistChannels",data,callback);
        },
        addBlacklistChannel:function (data,callback){ 
            this.add("blacklistChannels",data,callback);
        },
        getBlacklistChannel:function(callback){
            this.get("blacklistChannels",callback);
        },
        

        get:function (filePath,callback){  
            tizen.filesystem.resolve("documents/"+dataDirectory,function(dir) {
                var file = dir.resolve(filePath);  
                file.openStream("r",function(fs) {
                    //try{ 
                        var result="";
                        if(file.fileSize>0)
                            result=fs.read(file.fileSize);  
                        fs.close();
                        if(callback){
                            //try {
                                callback(result);    
                            //} catch (error) {
                                //log("code : 18 "+error);
                           // } 
                        }  
                    //}catch(error){log("code : 9 "+error);}  
                },function(error) {log("code : 10 "+ error.message);}, "UTF-8");

            },function(error){log("code : 11 "+error);});     
        }, 
        set:function (filePath,data,callback){  
            tizen.filesystem.resolve("documents/"+dataDirectory,function(dir) {
                var file = dir.resolve(filePath);  
                file.openStream("w",function(fs) {
                    try{
                        fs.write(data);
                        fs.close();
                        if(callback){
                            try {
                                callback(true);    
                            } catch (error) {
                                log("code : 19 "+error);
                            } 
                        } 
                    }catch(error){log("code : 12 "+error);} 
                    
                },function(error) {log("code : 13 "+ error.message);}, "UTF-8");

            },function(error){log("code : 14 "+error);});     
        }, 
        add:function (filePath,data,callback){  
            tizen.filesystem.resolve("documents/"+dataDirectory,function(dir) {
                var file = dir.resolve(filePath);  
                file.openStream("a",function(fs) {
                    try{ 
                        fs.position=file.fileSize;
                        fs.write(data); 
                        fs.close();
                        if(callback){
                            try { 
                                callback(true);    
                            } catch (error) {
                                log("code : 20 "+error);
                            } 
                        } 
                    }catch(error){log("code : 15 "+error);} 
                    
                },function(error) {log("code : 16 "+ error.message);}, "UTF-8"); 

            },function(error){log("code : 17 "+error);});     
        }, 

        getAsync:  function (filePath){  
            return (new Promise(function(resolve,reject){
                tizen.filesystem.resolve("documents/"+dataDirectory,function(dir) {
                    var file = dir.resolve(filePath);  
                    file.openStream("r",function(fs) {
                        //try{ 
                            var result="";
                            if(file.fileSize>0)
                                result=fs.read(file.fileSize);  
                            fs.close();
                            resolve(result); 
                             
                        //}catch(error){log("code : 9 "+error);}  
                    },function(error) {log("code : 10 "+ error.message); reject(false)}, "UTF-8");
    
                },function(error){log("code : 11 "+error.message);reject(false)});     
            })) ; 
        },
        
        setAsync:  function (filePath,data){  
            return (new Promise(function(resolve,reject){

                tizen.filesystem.resolve("documents/"+dataDirectory,function(dir) {
                    var file = dir.resolve(filePath);  
                    file.openStream("w",function(fs) {
                        try{
                            fs.write(data); 
                            fs.close();
                            resolve(true); 
                        }catch(error){log("code : 12 "+error);} 
                        
                    },function(error) {log("code : 13 "+ error.message);reject(false)}, "UTF-8");
    
                },function(error){log("code : 14 "+error);reject(false);});  
            })) ; 
        },
        
        addAsync:  function (filePath,data){  
            return (new Promise(function(resolve,reject){ 
                tizen.filesystem.resolve("documents/"+dataDirectory,function(dir) {
                    var file = dir.resolve(filePath);  
                    file.openStream("a",function(fs) {
                        try{
                            fs.position=file.fileSize;
                            fs.write(data); 
                            fs.close();
                            resolve(true); 
                        }catch(error){log("code : 15 "+error);} 
                        
                    },function(error) {log("code : 16 "+ error.message);reject(false);}, "UTF-8");
    
                },function(error){log("code : 17 "+error);reject(false);});  
            })) ; 
        },

        setChannelLinkAsync:function (data){ 
            return this.setAsync("channelDataLinks",data);
        },
        addChannelLinkAsync:function (data){ 
            return this.addAsync("channelDataLinks",data);
        },
        getChannelLinkAsync:function(){
            return this.getAsync("channelDataLinks");
        },

        setPasswordAsync:function (data){ 
            return this.setAsync("password",data);
        },
        addPasswordAsync:function (data){ 
            return this.addAsync("password",data);
        },
        getPasswordAsync:function(){
            return this.getAsync("password");
        },

        setBlacklistCategoryAsync:function (data){ 
            return this.setAsync("blacklistCategories",data);
        },
        addBlacklistCategoryAsync:function (data){ 
            return this.addAsync("blacklistCategories",data);
        },
        getBlacklistCategoryAsync:function(){
            return this.getAsync("blacklistCategories");
        },

        setBlacklistChannelAsync:function (data){ 
            return this.setAsync("blacklistChannels",data);
        },
        addBlacklistChannelAsync:function (data){ 
            return this.addAsync("blacklistChannels",data);
        },
        getBlacklistChannelAsync:function(){
            return this.getAsync("blacklistChannels");
        }, 
    }
   

}());