var AWSXRay = require('aws-xray-sdk');
var faker = require('faker');
AWSXRay.captureHTTPsGlobal(require('https'));
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
const https = require('https');
const Dao = require('./dao.js');
const utils = require('./util.js');



exports.handler = async (event) => {
    
  var document = AWSXRay.getSegment();

  console.log(`rootSegment--> ${JSON.stringify(document)}`); 

  // Anotation does not work with the root segment
  //document.addAnnotation("quoteNumber", "1234");
  //AWSXRay.getSegment().addMetadata("quoteNumber", "1234");
  //AWS.getSegment().addAnnotation("quoteNumber", "1234");
    
  const subsegment = document.addNewSubsegment('sentinel');
  let quotenumber= faker.finance.account();
  subsegment.addAnnotation("quoteNumber", quotenumber);
  subsegment.addMetadata("quoteNumber", quotenumber);
  subsegment.close();

  
  
let dataString = '';

const daoReponse= await Dao.getAlbumData("medicine at midnight");    
console.log(`daoResponse--> ${JSON.stringify(daoReponse)}`); 


// inserting into dynamodb
var albumDetails = {};
albumDetails.Album=faker.music.genre();
albumDetails.Artist=faker.name.findName();
await Dao.insertAlbumData(albumDetails);

/**let tracid= {
  trace_id : document.trace_id,
  id : document.id

}**/


// publishing to sns

let snsEventRecord = {};
snsEventRecord.data = {};
snsEventRecord.data.Album = faker.music.genre();;
snsEventRecord.data.Artist = faker.name.findName();
//snsEventRecord.data.traceData = tracid;

await Dao.publishEventToSNS(JSON.stringify(snsEventRecord));


    const response = await new Promise((resolve, reject) => {                
var options = {
  hostname: 'csaa-apihub.getsandbox.com',
  port: 443,
  path: '/api/csaa/home/v1/quotes/123',
  method: 'GET'
};
                
        const req = https.get(options, function(res) {
          res.on('data', chunk => {
            console.log(`chunk--> ${chunk}`);  
            dataString += chunk;
          });
          res.on('end', () => {
            resolve({
                statusCode: 200,
                body: JSON.stringify(JSON.parse(dataString), null, 4)
            });
          });
        });
        
        req.on('error', (e) => {
          console.log(`error--> ${e}`);  
          reject({
              statusCode: 500,
              body: 'Something went wrong!'
          });
        });
    });


        
console.log(`response-->${response}`);  
    return response;
};


exports.subHandler = async (event, context) => {
    
//var document = AWSXRay.getSegment();      
//console.log(`rootSegment-->  ${JSON.stringify(document)}`); 
const lambdaExecStartTime = new Date().getTime() / 1000

// write logic of handling the sqs records
for (const record of event.Records) {    
  const lambdaSegment = utils.createLambdaSegment (
          record,
          lambdaExecStartTime,
          context.functionName,
          context.invokedFunctionArn,
          context.awsRequestId
        );
        AWSXRay.setSegment(lambdaSegment);
  try {
                          
       console.log(`record==> ${JSON.stringify(record)}  `); 
       console.log(`message==> ${JSON.parse(record.body).Message}  `);       
       let msgObj= JSON.parse(JSON.parse(record.body).Message);
       console.log(`album==> ${msgObj.data.Album}`);       
       const subsegment = lambdaSegment.addNewSubsegment('sentinel');    
       subsegment.addAnnotation("album", msgObj.data.Album);       
        subsegment.close()               
        lambdaSegment.close()


       
  }catch (e){
    console.log(`error ==> ${JSON.stringify(e)}`);
//      return {"batchItemFailures":[{"itemIdentifier": curRecordSequenceNumber}]};      
      lambdaSegment.close()

  }
 }

 // this is another way of creating susegment.. Here you dont have to explicity closed the segment
/**  for (const record of event.Records) {  
      AWSXRay.captureFunc('annotations', function(subsegment){                
                    try {                                      
                      console.log(`record==> ${JSON.stringify(record)}  `);                     
                      console.log(`message==> ${JSON.parse(record.body).Message}  `);       
                      let msgObj= JSON.parse(JSON.parse(record.body).Message);
                      console.log(`album==> ${msgObj.data.Album}`);
                      const lambdaSegment = utils.createLambdaSegment(
                        record,
                        lambdaExecStartTime,
                        context.functionName,
                        context.invokedFunctionArn,
                        context.awsRequestId
                    )                             
                      subsegment.addAnnotation("album", msgObj.data.Album);                                                   
                }catch (e){
                  console.log(`error ==> ${JSON.stringify(e)}`);          
                }
          });
    }   */ 
   return {};
};