#!/usr/bin/env node
import 'source-map-support/register';
import {App} from "aws-cdk-lib";
import {GhaPocStack} from "../lib/cdk-stack";
import * as Console from "node:console";
import {BackendFargateCdkStack} from "../lib/backend-stack";

const app = new App();

Console.log('Hello from bin/cdk.ts')
new GhaPocStack(app, 'gha-poc-stack', {});
new BackendFargateCdkStack(app, "backend-fargate-stack", {});