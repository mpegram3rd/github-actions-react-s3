# Infrastructure as Code
This folder contains the files for setting up the AWS infrastructure for the rest of the project. 

If you wish to change to the AWS infrastructure please do them here instead of directly in the AWS Console. This way
there is a repeatable process that can be peer reviewed.
## Useful commands


* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
