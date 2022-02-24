import moment from "moment";
import { openDatabase } from "react-native-sqlite-storage";
var db = openDatabase({name:'Vayyup.db'})
export function createTable(){
    db.transaction(function(txn){
        txn.executeSql(
            'CREATE TABLE IF NOT EXISTS localVideos(id INTEGER PRIMARY KEY AUTOINCREMENT,finalVideo LONGTEXT,videoUri LONGTEXT,userId VARCHAR(45),user_name VARCHAR(164),user_profile LONGTEXT,title VARCHAR(100),description VARCHAR(256),startDateTime VARCHAR(100),endDateTime VARCHAR(100),competitionId VARCHAR(45),status VARCHAR(45),type VARCHAR(45), isLocal VARCHAR(20),uploadedTime INTEGER)',[]
        )
    })
}

export function insertVideo(video) {
    let currentDate = moment().valueOf()
    return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql(
                'INSERT INTO localVideos (finalVideo,videoUri,userId,user_name,user_profile,title,description,startDateTime,endDateTime,competitionId, status, type,isLocal,uploadedTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [video.finalVideo,video.videoUri,video.userId,video.user_name,video.user_profile,video.title,video.description,video.startDateTime,video.endDateTime,video.competitionId,video.status, video.type,"true",currentDate],
                (tx, result) => {
                    if (result.rowsAffected > 0) {
                        resolve(result);
                     
                        return result;
                    }
                }
            );
        })
    })
}

export function updateVideo(id, status) {
       return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql('UPDATE localVideos SET status= ? WHERE id = ?',[status, id],(tx, result) => {
                    resolve(result);
                  
                    return result;
            })
        })
    })
}

export function updateSyncedVideo(id, status, finalVideo) {
    
    return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql('UPDATE localVideos SET status= ?, finalVideo= ? WHERE id = ?',[status, finalVideo, id],(tx, result) => {
                    resolve(result);
                    return result;
            })
        })
    })
}

export function deleteVideo(id) {
     return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql(`DELETE FROM localVideos WHERE id=${id}`,[],(tx, result)=>{
                return result
            })
        })
    })
}

export function deleteVideobasedonName(name) {
   
    return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql(`DELETE FROM localVideos WHERE finalVideo LIKE ?`,[name],(tx, result)=>{
                return result
            })
        })
    })
}


export function deleteAllVideo() {
   
    return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql(`DELETE FROM localVideos`,(tx, result)=>{
                   return result
            })
        })
    })
}


export function getVideosList() {
    return new Promise((resolve) => {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM localVideos', [], (tx, results) => {
                var data = [];
                for (let i = 0; i < results.rows.length; ++i)
                    data.push(results.rows.item(i));
                resolve(data);
                return data;
            })
        })
    })
}
