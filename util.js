//import { Handler, SQSEvent, SQSRecord } from "aws-lambda"

var AWSXRay = require('aws-xray-sdk');
var AWSXSdk= require('aws-sdk')

//import { Segment, setSegment, utils } from "aws-xray-sdk"

function createLambdaSegment(
    sqsRecord ,
    lambdaExecStartTime ,
    functionName ,
    functionArn ,
    awsRequestId
) {    
    const traceHeaderStr = sqsRecord.attributes.AWSTraceHeader
    const traceData = AWSXRay.utils.processTraceData(traceHeaderStr)
    const sqsSegmentEndTime = Number(sqsRecord.attributes.ApproximateFirstReceiveTimestamp) / 1000
    const lambdaSegment = new AWSXRay.Segment(
        functionName,
        traceData.root,
        traceData.parent
    )
    lambdaSegment.origin = "AWS::Lambda::Function"
    lambdaSegment.start_time = lambdaExecStartTime - (lambdaExecStartTime - sqsSegmentEndTime)
    lambdaSegment.addPluginData({
        function_arn: functionArn,
        region: sqsRecord.awsRegion,
        request_id: awsRequestId
    })
    return lambdaSegment
}

module.exports = {
    createLambdaSegment
}
