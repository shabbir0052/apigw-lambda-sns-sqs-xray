const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: false });
var sns = new AWS.SNS({ apiVersion: '2010-03-31' });

async function getAlbumData(albumName) {    
    var params = {
        TableName: "csaa-apihub-testdds-poc-table" ,
        ProjectionExpression:"Album, Artist",
        KeyConditionExpression: 'Album = :Album',
            ExpressionAttributeValues: {
                ':Album': albumName                
            }
            
    }
    try {
        const res = await docClient.query(params).promise();       
        if (res.Items && res.Items.length > 0) {            
           return res.Items;
        } else {            
        }
        return {};
    } catch (err) {        
        return {};
    }
}

async function insertAlbumData(albumData){
    
    var params = {
        TableName: "csaa-apihub-testdds-poc-table",
        Item: albumData,
        ReturnValues: 'ALL_OLD',
    }
    try{
        const response= await docClient.put(params).promise();        
        return response;           
        
    }catch(err){
                
        return {};
    }
}


//publishing to sns
async function publishEventToSNS(event) {    
    
    var params = {
      Message: event,
      TopicArn: "arn:aws:sns:us-west-2:812883686337:csaa-apihub-poc-sns-topic"
    };
    var publishTextPromise = sns.publish(params).promise();
    return publishTextPromise
      .then(function (data) {                
        return data;
      })
      .catch(function (err) {
        return err;
      });
  }

module.exports = {
    getAlbumData,
    insertAlbumData,
    publishEventToSNS
}