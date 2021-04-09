aws --profile 812883686337-SSO-CSAAPIHubDeveloperRole cloudformation package --template-file template.yaml --output-template-file template.packaged.yaml --s3-bucket csaa-apihub-cdktoolkit

aws --ca-bundle 'C:\Users\epxvhus\.aws\ca-bundle.crt' --profile 812883686337-SSO-CSAAPIHubDeveloperRole cloudformation deploy --template-file template.packaged.yaml --stack-name csaa-apihub-v1-xray-poc-dev --capabilities CAPABILITY_NAMED_IAM

Test
curl --location --request GET 'https://13yvhaj22l.execute-api.us-west-2.amazonaws.com/dev/hello'
